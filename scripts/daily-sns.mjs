// 毎日 1 本、公開ずみの記事から SNS 投稿用のファイル（X の画像と文章、Instagram の表紙・カルーセル 5 枚・リール動画と投稿文）を作る
// Instagram のほうがフォロワーが多い（2026-11-10）。Instagram はカルーセル（carousel-1〜5.png ＋ instagram-caption.txt）を主にし、リール（reel.mp4 ＋ instagram-reel-caption.txt）も出す
// 投稿は自動ではしない。運営者が中身を確かめてから、X・Instagram の画面から手で投稿する
//
// 使い方:
//   npm run sns:daily            # 次の 1 本を作る
//   npm run sns:daily -- --dry   # 次にどの記事を作るかを表示するだけ
//   npm run sns:daily -- --count 7  # 7 本まとめて作る
//   npm run sns:daily -- --slug cafe-cup-warmer,cafe-latte-art  # 記事を指定して、今日の日付で作る
//   npm run sns:daily -- --rebuild-reels  # 今日から先の日付のフォルダーのリール動画だけを、今の作り方で作り直す（文章は変えない）
//
// - フォルダー名には投稿する予定の日付をつける（すでにある最後の日付から順に、1 日 1 本。日曜だけ 2 本）
// - 毎朝の実行では、1 週間先（今日から 6 日後）まで用意できていれば何もしない
//
// - 古い記事から順に作る。作った記事は logs/daily-sns.json に記録し、2 回作らない
// - 保存先の SNS投稿 フォルダーに x-<slug>.png か instagram-<slug>/ がある記事は、手で作ったものとみなして飛ばす
// - 投稿文（1 行目の文・要点・ハッシュタグ）は Claude Code（claude -p）で作る。有料の Claude API は使わない
//   2026-11-28 にマスコット 2 人の会話の形をやめた。画像にはマスコットの代わりに、記事の業種に合う人物画を 1 人出す（personFor）
//   Claude Code が使えないときは、記事のタイトルを使ったひな形の文章にする
// - 保存先は SNS_OUT_DIR（.env.local）。なければ OneDrive のデスクトップの「SNS投稿\毎日」
// - 結果は logs/daily-sns.log に残る

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import matter from 'gray-matter';
import sharp from 'sharp';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SITE } from '../lib/site.js';

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, 'content', 'posts');
const LOG_FILE = path.join(ROOT, 'logs', 'daily-sns.log');
const STATE_FILE = path.join(ROOT, 'logs', 'daily-sns.json');
const SNS_DIR = path.join(os.homedir(), 'OneDrive', 'デスクトップ', 'SNS投稿');
const OUT_DIR = process.env.SNS_OUT_DIR || path.join(SNS_DIR, '毎日');
const DRY_RUN = process.argv.includes('--dry');
const COUNT_ARG = process.argv.indexOf('--count');
const COUNT = COUNT_ARG >= 0 ? Math.max(1, Number(process.argv[COUNT_ARG + 1]) || 1) : 0;
const SLUG_ARG = process.argv.indexOf('--slug');
const SLUGS = SLUG_ARG >= 0 ? String(process.argv[SLUG_ARG + 1] ?? '').split(',').map((s) => s.trim()).filter(Boolean) : [];
const STOCK_DAYS = 6;
const X_LIMIT = 280;

// SNS の画像の色（ブログと同じ）
const C = { bg: '#fbf1e4', ink: '#2f2725', muted: '#625955', accent: '#a4441d' };
const FONT = "'Yu Gothic', 'Meiryo', sans-serif";

function log(message) {
  const line = `[${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}] ${message}`;
  console.log(line);
  if (DRY_RUN) return;
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  fs.appendFileSync(LOG_FILE, `${line}\n`, 'utf8');
}

const readState = () => (fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : { done: [] });
const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const addDays = (date, n) => new Date(Date.parse(`${date}T00:00:00Z`) + n * 86400e3).toISOString().slice(0, 10);

// 1 日に作る本数（日曜は 2 本、ほかの日は 1 本）
const postsPerDay = (date) => (new Date(`${date}T00:00:00Z`).getUTCDay() === 0 ? 2 : 1);

// 保存先にある予定日（フォルダー名の先頭の日付）の一覧
function plannedDates() {
  if (!fs.existsSync(OUT_DIR)) return [];
  return fs.readdirSync(OUT_DIR).map((n) => n.slice(0, 10)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
}
// 保存先にある最後の予定日
function lastPlannedDate() {
  return plannedDates().at(-1) ?? null;
}
// 次の予定日：今日から順に見て、その日の本数がまだ足りない最初の日
// （あとから日曜を 2 本にしたときも、すでに 1 本だけの日曜を先に埋める）
function nextPlannedDate() {
  const dates = plannedDates();
  let d = today();
  while (dates.filter((x) => x === d).length >= postsPerDay(d)) d = addDays(d, 1);
  return d;
}

// 公開ずみの記事を古い順に並べる
function listPosts() {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'));
      return { slug: file.replace(/\.md$/, ''), data, content };
    })
    .sort((a, b) => `${a.data.date}${a.data.publishedAt ?? ''}`.localeCompare(`${b.data.date}${b.data.publishedAt ?? ''}`));
}

// 手で作った投稿があるか（以前に作った X の画像・Instagram のフォルダー）
const madeByHand = (slug) =>
  fs.existsSync(path.join(SNS_DIR, `x-${slug}.png`)) || fs.existsSync(path.join(SNS_DIR, `instagram-${slug}`));

// 広告のリンクがある記事か（あれば #PR をつける）
const hasAds = (post) =>
  ['products', 'picks', 'services'].some((k) => post.data[k]?.length) ||
  /amazon\.co\.jp|moshimo\.com|rakuten|a8\.net|valuecommerce/.test(post.content);

// X の文字数（日本語などは 2、URL は 23 と数える）
export function xLength(text) {
  let n = 0;
  for (const ch of text.replace(/https?:\/\/\S+/g, 'x'.repeat(23))) {
    const c = ch.codePointAt(0);
    n += c <= 0x10ff || (c >= 0x2000 && c <= 0x200d) || (c >= 0x2010 && c <= 0x201f) || (c >= 0x2032 && c <= 0x2037) ? 1 : 2;
  }
  return n;
}

// 2026-11-28 にマスコット 2 人の会話の形をやめ、ふつうの文にした（初めて見た人には、誰が話しているのか分からなかったため）
// 1 行目（hook）で読む人の困りごと・得することが分かるようにし、要点（points）を本文に書いて、投稿だけでも役に立つようにする
const SYSTEM_PROMPT = `あなたは、小さなお店を開く前の人に向けたブログ「mise & register」の、X と Instagram の投稿文を書きます。
キャラクターのセリフや会話の形にはしないでください。ふつうの短い文で書きます。
決まり:
- hook：投稿の 1 行目。読む人の困りごとか、読むと得することが、ひと目で分かる文（35 文字以内）。
  例「4万円台のPOSレジ、買う前に確かめたい5つ」「キャッシュドロアが開かないときは、この順に確かめます」
  「〜について記事にまとめました」「〜を紹介しています」のような紹介の言い方にしない。カギかっこ（「」）やキャラクターの名前は使わない
- points：記事の要点を 3〜4 個（1 個 30 文字以内）。それだけ読んでも役に立つ、具体的な中身にする（「〜が分かります」ではなく、中身そのもの）。
  例「最初の日はテストデータの精算から」「伝票の訂正は営業中にレジ締め前伝票一覧から」
- hook と points には絵文字・顔文字を入れない（画像にも使うため）
- hook_deco：hook の最後に付ける絵文字を 1 個まで。内容に合うものがなければ空文字にする。法律・資格・料金・安全の注意が中心の記事は空文字にする
- おじさん構文にしない：絵文字や記号を重ねない、語尾をカタカナにしない（「〜ネ」「〜カナ」）、馴れ馴れしくしない。😅😘❣️、ハート、！の連続は使わない
- やさしい「です・ます」か、言い切らない短い文で書く。むずかしい言葉を使わない
- 記事に書かれていることだけを書く。記事にない数字・効果・体験談を足さない
- 「必ず」「絶対」「いちばん安い」のような言い切りや大げさな言い方はしない
- hashtags：記事に合うハッシュタグを 2 個（# をつける。#PR は入れない）`;

// セリフの最後に付ける絵文字・顔文字を確かめる。決まりに合わないものは付けない
// 😅😘❣ は Z 世代に古い印象とされる（Simeji 調査 2026 年 6 月）。🫪 は iOS 26.4 の新しい絵文字で、古い端末では表示できないおそれがある
const DECO_BLOCKED = /[😅😘❣🫪🤮🖕❗❕‼💕💖💗💞💓❤♥]/u;
function cleanDeco(value) {
  const deco = String(value ?? '').trim();
  if (!deco || [...deco].length > 12) return '';
  if (DECO_BLOCKED.test(deco) || /[@＠#＃\\<>「」\s]/.test(deco)) return '';
  // 言葉を混ぜない（「〜ネ」のような語尾を防ぐ）。絵文字は 1 個まで
  if (/[\p{sc=Han}\p{sc=Hiragana}]|[ァ-ヶ]{2,}/u.test(deco)) return '';
  if ((deco.match(/\p{Extended_Pictographic}/gu) ?? []).length > 1) return '';
  return deco;
}

// 記事の見出し（## の行）を集める。投稿文を作るときの材料にする
const headings = (content) => [...content.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]).slice(0, 12);

// claude -p に渡す環境変数。.env.local の ANTHROPIC_API_KEY（ブログの別の機能用）を渡すと、
// ログイン（定額のプラン）ではなく有料の API キーで動いてしまうので、Claude 用のキーは外す
export function claudeEnv(env = process.env) {
  const out = { ...env };
  for (const key of ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN']) delete out[key];
  return out;
}

// 要点を記事の中身から選べるように、本文の初めのほうを渡す（画像・リンクの URL・HTML のタグは外す。コマンドの長さの上限があるので 3500 文字まで）
export function articleExcerpt(content, max = 3500) {
  return String(content)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

// Claude Code に投稿文を書いてもらう（ツールは使わせない）
export function buildPrompt(post) {
  return `${SYSTEM_PROMPT}

次の記事の投稿文を、JSON だけで返してください（前後に説明やコードブロックの記号をつけない）。
形: {"hook": "...", "hook_deco": "...", "points": ["...", "...", "..."], "hashtags": ["#...", "#..."]}

記事のタイトル: ${post.data.title}
記事の説明: ${post.data.description ?? ''}
見出し:
${headings(post.content).map((h) => `- ${h}`).join('\n')}

記事の本文（初めのほう）:
${articleExcerpt(post.content)}`;
}

// claude -p から返ってきた JSON を確かめて、投稿文に使う形にそろえる
export function normalizeTalk(raw) {
  const talk = { ...raw };
  const points = Array.isArray(talk.points) ? talk.points : talk.caption_points;
  if (!talk.hook || !Array.isArray(points) || !points.length || !Array.isArray(talk.hashtags)) throw new Error('返ってきた JSON の形が違います');
  talk.hook = String(talk.hook).trim();
  talk.caption_points = points.map((p) => String(p).trim()).filter(Boolean);
  delete talk.points;
  // 1 行目と要点は画像にも使うので、絵文字を入れない。絵文字は投稿文の 1 行目の最後にだけ付ける
  if (/\p{Extended_Pictographic}/u.test(talk.hook + talk.caption_points.join(''))) throw new Error('1 行目か要点に絵文字が入っています');
  // マスコットのセリフの形に戻らないようにする
  if (/レジまる|ポスタ|「/.test(talk.hook)) throw new Error('1 行目がセリフの形になっています');
  talk.hook_deco = cleanDeco(talk.hook_deco);
  // ハッシュタグは「#」をつけ、#PR は広告のある記事だけにあとでつける
  talk.hashtags = talk.hashtags.map((t) => `#${String(t).replace(/^#/, '').trim()}`).filter((t) => t !== '#' && t !== '#PR');
  return talk;
}

function writeTalk(post) {
  const prompt = buildPrompt(post);
  const result = spawnSync('claude', ['-p', prompt], { cwd: ROOT, encoding: 'utf8', timeout: 10 * 60 * 1000, env: claudeEnv() });
  if (result.error) throw new Error(`Claude Code を起動できませんでした（${result.error.message}）`);
  if (result.status !== 0) {
    // 1 行目は「⚠」で始まる注意書きのことがあるので、それ以外の行を記録に残す
    const lines = `${result.stderr ?? ''}\n${result.stdout ?? ''}`.split('\n').map((s) => s.trim()).filter(Boolean);
    const reason = lines.filter((s) => !s.startsWith('⚠')).slice(-3).join(' / ') || lines[0] || '理由の表示なし';
    throw new Error(`終了コード ${result.status}（${reason}）`);
  }
  const json = (result.stdout ?? '').match(/\{[\s\S]*\}/);
  if (!json) throw new Error('返ってきた文章が JSON ではありません');
  return normalizeTalk(JSON.parse(json[0]));
}

// Claude Code が使えないときのひな形
// 1 行目はタイトルの前半（「Amazonの4万円台のPOSレジは買っていい？」など、読む人の疑問の形が多い）。要点は記事の見出しから取る
export function templateTalk(post) {
  const [main] = String(post.data.title).split('｜');
  return {
    hook: main.trim(),
    hook_deco: '',
    // 見出しの先頭の番号（「1. 」など）は、箇条書きの「・」と重なるので外す
    caption_points: headings(post.content).filter((h) => !/よくある質問|まとめ|参考/.test(h)).slice(0, 4).map((h) => h.replace(/^\d+[.．、]\s*/, '')),
    hashtags: ['#小さなお店', '#開業準備'],
  };
}

const postUrl = (post) => {
  // パソコンで動かすと SITE.url が仮の URL になることがあるため、そのときは本番の URL を使う
  const base = SITE.url.includes('example.com') ? 'https://www.mise-register.com' : SITE.url.replace(/\/$/, '');
  return `${base}/posts/${post.slug}`;
};

// X：1 行目で困りごと・得することを書き、要点を 2 個まで本文に入れる（投稿だけでも役に立つように）。280 を超えるときは要点を減らす
// maxPoints：要点の数の上限。ふつうは 2 個。「役立つ」カルーセルの短い見出し（「鍵の位置」など）は多めに入れる
export function buildXText(post, talk, ads, maxPoints = 2) {
  const tags = [...talk.hashtags.slice(0, 2), ...(ads ? ['#PR'] : [])].join(' ');
  const head = `${talk.hook}${talk.hook_deco ?? ''}`;
  for (let n = Math.min(maxPoints, talk.caption_points.length); n >= 0; n--) {
    const points = talk.caption_points.slice(0, n).map((p) => `・${p}`);
    const text = [head, ...(points.length ? ['', ...points] : []), '', postUrl(post), tags].join('\n');
    if (xLength(text) <= X_LIMIT) return text;
  }
  return [head, postUrl(post), tags].join('\n');
}

// Instagram はフォロワーが多いので、カルーセル（めくる画像）を主にする
// 一覧では最初の 1〜2 行しか見えないので、1 行目に困りごと・得することを書く
export function buildCaption(post, talk, ads) {
  const tags = [...talk.hashtags, '#小さなお店', '#お店づくり', '#開業準備', ...(ads ? ['#PR'] : [])];
  return `${talk.hook}${talk.hook_deco ?? ''}

▼要点
${talk.caption_points.map((p) => `・${p}`).join('\n')}

画像を横にめくると、要点と記事の目次が見られます。
あとで見返せるように、保存しておいてください。
記事「${String(post.data.title).split('｜')[0]}」は、プロフィールのリンク（mise & register）から見られます。

${[...new Set(tags)].join(' ')}
`;
}

// リールの投稿文：動画で中身を見せるので短くする
export function buildReelCaption(post, talk, ads) {
  const tags = [...talk.hashtags, '#小さなお店', '#開業準備', ...(ads ? ['#PR'] : [])];
  return `${talk.hook}${talk.hook_deco ?? ''}
${talk.caption_points.slice(0, 2).map((p) => `・${p}`).join('\n')}

くわしくは、プロフィールのリンク（mise & register）から。
保存しておくと、あとで見返せます。

${[...new Set(tags)].join(' ')}
`;
}

// 下地（四隅の色）で割って白くする。乗算で重ねると、四角い下地が見えない
async function whiten(file, w, h) {
  const { data, info } = await sharp(file).resize(w, h).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const bg = [0, 0, 0];
  let cnt = 0;
  for (const [x0, y0] of [[0, 0], [w - 8, 0], [0, h - 8], [w - 8, h - 8]])
    for (let y = y0; y < y0 + 8; y++)
      for (let x = x0; x < x0 + 8; x++) {
        const i = (y * w + x) * 3;
        for (let c = 0; c < 3; c++) bg[c] += data[i + c];
        cnt++;
      }
  for (let c = 0; c < 3; c++) bg[c] /= cnt;
  for (let i = 0; i < data.length; i += 3)
    for (let c = 0; c < 3; c++) data[i + c] = Math.min(255, Math.round((data[i + c] * 255) / bg[c]));
  return sharp(data, { raw: info }).png().toBuffer();
}
const put = async (file, w, h, left, top) => ({ input: await whiten(file, w, h), left, top, blend: 'multiply' });

// ---- SNS の画像に出す人物（2026-11-28 にマスコット 2 体から差し替え） ----
// 年配に見える人は使わない（運営者の決まり）。school・dining・florist・life・relax は若い人の別の絵（表情ちがいがないので smile・think は同じ絵）、bakery は p-bakery2
// 2026-11-28 に記事用の人を足した：register（smile と think は別の絵）・office・gym・pet・farm・golf・recycle（この 6 つと dental は smile・think が同じ絵）
// 絵は「mise & ひとふでノート」の POP 用の人物画（Canva の AI で作成。使ってよいことは運営者が確認済み）を
// public/images/sns-people/<業種>-<表情>.webp に縮小してコピーしたもの。絵そのものは加工しない
// 記事の業種に合う人を 1 人出す。上から順に見て、最初に当てはまった業種にする。どれでもなければカフェの人
export const PERSON_RULES = [
  ['hotel', /ホテル|旅館|宿泊|hotel|simphony/i],
  ['florist', /花屋|フラワー|florist/i],
  ['school', /教室|スクール|レッスン|school/i],
  ['bakery', /パン屋|ベーカリー|bakery/i],
  ['sweets', /スイーツ|洋菓子|ケーキ|和菓子|sweets/i],
  ['relax', /整体|リラク|マッサージ|治療院|relax/i],
  ['park', /テーマパーク|遊園地|theme-?park/i],
  ['kitchen-car', /キッチンカー|移動販売|kitchen-car/i],
  ['salon', /サロン|美容院|美容室|エステ|ネイル|まつげ|salon|esthe|nail/i],
  ['apparel', /アパレル|雑貨|セレクトショップ|試着|古着|apparel|zakka/i],
  // カテゴリがカフェの記事（カフェバー・夜カフェなど）は、バーの話でもカフェの人にする
  ['cafe', /^cafe\b/],
  // 「バー」は「バーコード」「サーバー」「ドライバー」にも含まれるので、タグがちょうど「バー」のときだけ当てる
  ['dining', /レストラン|居酒屋|ダイニング|#バー#|ラーメン|焼肉|restaurant|izakaya|dining/i],
  ['life', /クリーニング|清掃業|修理店|便利屋/i],
  // 業種の言葉がない記事は、カテゴリで決める（2026-11-28 に追加）。POS・周辺機器はレジ担当、レジ締め・Excel・補助金・売上は店主の事務
  ['register', /^devices\b/],
  ['office', /^management\b/],
];
// 表情：トラブル・注意の記事は考える顔、ほかは笑顔
const THINK_RULE = /トラブル対応|防犯|セキュリティ|not-opening|mismatch|trouble|error|broken|crime/i;
// 規則では合わない記事だけ、slug で決める（ペットホテルの話が出るペットショップ、業種をまたぐ記事など）
// 2026-11-28：ジム・ペットショップ・直売所・ゴルフ練習場・リサイクルショップ（買取）の人を新しく描いた。歯科医院は歯科医の絵
export const PERSON_BY_SLUG = {
  'pos-benefits-by-industry': 'cafe',
  'cafe-concept-types': 'cafe',
  'gym-pos': 'gym',
  'pet-shop-pos': 'pet',
  'farm-stand-pos': 'farm',
  'golf-range-pos': 'golf',
  'recycle-shop-pos': 'recycle',
  'simple-shop-repair-buyback': 'recycle',
  'dental-clinic-pos': 'dental',
};
export function personFor(post) {
  const d = post.data ?? {};
  const fixed = PERSON_BY_SLUG[post.slug];
  // タグは「#タグ#」の形でつなぐ（タグがちょうどその言葉のときだけ当てたい規則のため）
  const text = [d.category, ...(d.tags ?? []).map((t) => `#${t}#`), post.slug, d.title].filter(Boolean).join(' ');
  const genre = fixed ?? PERSON_RULES.find(([, re]) => re.test(text))?.[0] ?? 'cafe';
  const mood = THINK_RULE.test(text) ? 'think' : 'smile';
  return { genre, mood, file: path.join(ROOT, 'public', 'images', 'sns-people', `${genre}-${mood}.webp`) };
}
// 人物画を boxW×boxH の中に縦横比を保って収める（背景はもとから透明）。alignX で左右、alignY で上下の寄せ方を決める
async function placePerson(post, boxW, boxH, x, y, { alignX = 'center', alignY = 'bottom' } = {}) {
  const input = await sharp(personFor(post).file).resize(boxW, boxH, { fit: 'inside' }).png().toBuffer();
  const { width, height } = await sharp(input).metadata();
  const left = alignX === 'left' ? x : alignX === 'right' ? x + boxW - width : x + Math.round((boxW - width) / 2);
  const top = alignY === 'top' ? y : y + boxH - height;
  return { input, left, top };
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// タイトルを「｜」で行に分ける。いちばん長い行が幅に収まるように文字を小さくし、それでも長い行は折り返す
// 折り返して maxLines を超えるときは、minSize の 4 分の 3 まで文字をさらに小さくする
// それでも入らないときだけ、最後の行の終わりを「…」にする（黙って切ると、タイトルが途中で終わって見える）
export function fitTitle(title, width, maxSize, minSize, maxLines) {
  const parts = String(title).split('｜');
  const first = Math.max(minSize, Math.min(maxSize, Math.floor(width / Math.max(...parts.map((p) => jaWidth(p))))));
  const floor = Math.round(minSize * 0.75);
  const layout = (size) => parts.flatMap((part) => wrapJa(part, Math.floor(width / size)));
  for (let size = first; size >= floor; size--) {
    const lines = layout(size);
    if (lines.length <= maxLines) return { lines, size, cut: false };
  }
  const lines = layout(floor).slice(0, maxLines);
  const last = [...lines[maxLines - 1]];
  lines[maxLines - 1] = `${last.slice(0, Math.max(0, Math.min(last.length, Math.floor(width / floor) - 1))).join('')}…`;
  return { lines, size: floor, cut: true };
}
const textLines = (lines, x, y, size, lh, opt = '') =>
  lines.map((t, i) => `<text x="${x}" y="${y + i * lh}" font-size="${size}" ${opt}>${esc(t)}</text>`).join('');

export async function makeXImage(post, illus, file) {
  const { lines, size } = fitTitle(post.data.title, 800, 40, 30, 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><rect width="1200" height="675" fill="${C.bg}"/>
<g font-family="${FONT}" fill="${C.ink}">${textLines(lines, 60, 80, size, Math.round(size * 1.45), 'font-weight="800"')}</g>
<rect x="60" y="160" width="90" height="6" fill="${C.accent}"/></svg>`;
  // 人物は左下（タイトルの下・挿絵の左）に、下の端にそろえて置く
  const layers = [];
  if (illus) layers.push(await put(illus, 860, 482, 340, 193));
  layers.push(await placePerson(post, 290, 420, 40, 255));
  await sharp(Buffer.from(svg)).composite(layers).png().toFile(file);
}

async function makeInstagramCover(post, illus, file) {
  const { lines, size } = fitTitle(post.data.title, 920, 62, 46, 3);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect width="1080" height="1350" fill="${C.bg}"/>
<g font-family="${FONT}" fill="${C.ink}">
${textLines(lines, 80, 860, size, Math.round(size * 1.4), 'font-weight="800"')}
<rect x="80" y="1110" width="120" height="8" fill="${C.accent}"/>
<text x="80" y="1290" font-size="30" fill="${C.muted}" font-weight="700">mise &amp; register</text></g></svg>`;
  // 人物は右下（タイトルの 3 行目より下）に、下の端にそろえて置く
  const layers = [await placePerson(post, 250, 290, 760, 1060, { alignX: 'right' })];
  if (illus) layers.unshift(await put(illus, 1080, 606, 0, 160));
  await sharp(Buffer.from(svg)).composite(layers).png().toFile(file);
}

// ---- Instagram のリール動画（縦長 1080×1920・4 場面・BGM 付き・16 秒） ----
// ffmpeg の場所は FFMPEG_PATH（.env.local）。なければ PATH の ffmpeg を使う。見つからないときは動画を作らずに飛ばす
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const REEL_BGM = path.join(ROOT, 'scripts', 'assets', 'reel-bgm.m4a');
const RW = 1080, RH = 1920;

// 日本語を全角 n 文字分の幅で折り返す（半角は 0.55 文字分）。「ばら|ばら」「比べ|方」のように単語の途中で切らない
// 切ってよいのは、助詞や読点（「て」「が」「を」「、」など）で終わる単語のあと。次のどちらかの順に探す
// 1. そのあとに漢字・カタカナ・英数字が来るところ（「順番が|人によって」）。ここを文節の切れ目とみなす
// 2. 文節が 1 行に入らないときは、助詞で終わる単語のあと（「なって|いませんか」）。それでも入らなければ単語の切れ目、最後は文字
// 句読点・小さい字・1 文字の助詞は前の単語に、「お」「ご」は後ろの単語にくっつけて、行の頭や終わりに残らないようにする
const JA_SEGMENTER = new Intl.Segmenter('ja', { granularity: 'word' });
const jaWidth = (s) => [...s].reduce((sum, ch) => sum + (/[ -~]/.test(ch) ? 0.55 : 1), 0);
const JA_BREAK_AFTER = /[てでにをはがのともへやかねよ、。」』）？！]$/;
function wrapJa(str, n) {
  const words = [];
  for (const { segment } of JA_SEGMENTER.segment(String(str))) {
    const prev = words.at(-1);
    const tail = /^[。、，．」』）？！ー…ぁぃぅぇぉっゃゅょァィゥェォッャュョ]/.test(segment) || (/^[ぁ-ゖ][。、？！]*$/.test(segment) && !/^[おご]$/.test(segment) && !/[。、？！」』）]$/.test(prev ?? ''));
    const kana = /[ァ-ヶー]$/.test(prev ?? '') && /^[ァ-ヶ]/.test(segment); // 「スマ|レジ」のようなカタカナの続きはつなげる
    if (prev && (tail || kana || /^[おご]$/.test(prev))) words[words.length - 1] += segment;
    else words.push(segment);
  }
  // 文節 → 切れ目の候補（piece）→ 単語、の 3 段に分ける
  const chunks = [];
  for (const wd of words) {
    const prev = chunks.at(-1);
    const prevWord = prev?.pieces.at(-1).at(-1);
    if (!prev || (JA_BREAK_AFTER.test(prevWord) && (!/^[ぁ-ゖ]/.test(wd) || /^[おご][一-龠]/.test(wd)))) chunks.push({ pieces: [[wd]] });
    else if (JA_BREAK_AFTER.test(prevWord)) prev.pieces.push([wd]);
    else prev.pieces.at(-1).push(wd);
  }
  const out = [];
  let line = '';
  // items を、行に入るだけ詰める。1 つで 1 行に入らないものは、1 段細かくして詰める（文節 → 候補 → 単語 → 文字）
  const fill = (items) => {
    for (const item of items) {
      const text = Array.isArray(item) ? item.flat(Infinity).join('') : item;
      if (jaWidth(line + text) <= n) line += text;
      else if (jaWidth(text) <= n) { out.push(line); line = text; }
      else fill(Array.isArray(item) ? item : [...item]);
    }
  };
  fill(chunks.map((c) => c.pieces));
  if (line) out.push(line);
  return out;
}

// リールは、上（アカウント名）・下（説明文）・右（いいね などのボタン）が Instagram の表示に重なり、
// プロフィールの一覧やフィードでは上下が切り取られる。文字と絵は、この範囲の中だけに置く
const REEL_SAFE = { top: 300, bottom: 1500, left: 80, right: 940 };

export async function makeReelFrames(post, talk, illus, ads, dir) {
  const S = REEL_SAFE;
  const t = (x, y, s, size, color, weight = 700, anchor = 'start') =>
    `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;
  const cx = (S.left + S.right) / 2;
  const brand = t(cx, S.bottom - 10, 'mise & register', 36, C.muted, 700, 'middle');
  const pr = ads ? `<rect x="${S.right - 100}" y="${S.top}" width="100" height="52" rx="8" fill="none" stroke="${C.muted}" stroke-width="2"/>${t(S.right - 50, S.top + 37, 'PR', 30, C.muted, 700, 'middle')}` : '';
  const frame = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${RW}" height="${RH}"><rect width="${RW}" height="${RH}" fill="${C.bg}"/>${body}</svg>`);
  const files = [1, 2, 3, 4].map((i) => path.join(dir, `reel-${i}.png`));
  const box = '#fffaf3', line = '#e3d3bf';

  // 1. タイトルと挿絵（挿絵は、タイトルの下からロゴの上までの残りの高さに収める）
  const width = S.right - S.left;
  const { lines, size } = fitTitle(post.data.title, width, 76, 54, 4);
  const lh = Math.round(size * 1.35);
  const titleBottom = S.top + 110 + lines.length * lh;
  const illusH = Math.min(Math.round(width * 9 / 16), S.bottom - 80 - (titleBottom + 30));
  const illusW = Math.round(illusH * 16 / 9);
  const layers1 = illus && illusH > 200 ? [await put(illus, illusW, illusH, Math.round(cx - illusW / 2), titleBottom + 30)] : [];
  await sharp(frame(t(S.left, S.top + 37, '新しい記事', 42, C.accent) + pr + textLines(lines, S.left, S.top + 90 + size, size, lh, `font-family="${FONT}" font-weight="800" fill="${C.ink}"`) + brand))
    .composite(layers1).png().toFile(files[0]);

  // 2. 1 行目の文（読む人の困りごと・得すること）を大きく。2026-11-28 にマスコットの会話のコマから置き換えた
  const hookRows = wrapJa(talk.hook, Math.floor(width / 72));
  const hookTop = S.top + 260;
  await sharp(frame(`<rect x="${S.left}" y="${hookTop - 120}" width="120" height="10" fill="${C.accent}"/>` +
    hookRows.map((s, i) => t(S.left, hookTop + i * 104, s, 72, C.ink, 800)).join('') +
    t(S.left, hookTop + hookRows.length * 104 + 90, 'このあと、要点を順に見せます', 40, C.muted, 600) + brand)).png().toFile(files[1]);

  // 3. この記事で分かること
  // 2 行目からは「・」のぶん字下げする
  const points = talk.caption_points.slice(0, 4).flatMap((s) => wrapJa(s, 15).map((x, i) => (i ? [S.left + 92, x] : [S.left + 46, `・${x}`])));
  const rowH = Math.min(84, Math.floor((S.bottom - 80 - (S.top + 150) - 100) / Math.max(points.length, 1)));
  await sharp(frame(t(cx, S.top + 70, 'この記事で分かること', 66, C.ink, 700, 'middle') +
    `<rect x="${S.left}" y="${S.top + 150}" width="${width}" height="${100 + points.length * rowH}" rx="32" fill="${box}" stroke="${line}" stroke-width="3"/>` +
    points.map(([x, s], i) => t(x, S.top + 240 + i * rowH, s, 44, C.ink, 600)).join('') + brand)).png().toFile(files[2]);

  // 4. 締め
  await sharp(frame(t(cx, S.top + 80, 'くわしくは記事で', 84, C.ink, 700, 'middle') +
    t(cx, S.top + 210, 'ブログ「mise & register」に', 46, C.muted, 600, 'middle') + t(cx, S.top + 280, 'まとめています', 46, C.muted, 600, 'middle') +
    `<rect x="${cx - 330}" y="${S.top + 360}" width="660" height="116" rx="58" fill="${C.accent}"/>` + t(cx, S.top + 435, 'プロフィールのリンクから', 44, '#ffffff', 700, 'middle') +
    (ads ? t(cx, S.bottom - 80, 'この投稿には広告（PR）を含む記事の紹介があります', 28, C.muted, 500, 'middle') : '') + brand))
    .composite([await placePerson(post, 360, 500, cx - 180, S.top + 540)]).png().toFile(files[3]);
  return files;
}

async function makeInstagramReel(post, talk, illus, ads, dir) {
  const files = await makeReelFrames(post, talk, illus, ads, dir);
  const inputs = [[files[0], 4], [files[1], 5], [files[2], 4.5], [files[3], 4]].flatMap(([f, d]) => ['-loop', '1', '-t', String(d), '-i', f]);
  const filter = '[0:v]format=yuv420p,fps=30[a];[1:v]format=yuv420p,fps=30[b];[2:v]format=yuv420p,fps=30[c];[3:v]format=yuv420p,fps=30[d];' +
    '[a][b]xfade=transition=fade:duration=0.5:offset=3.5[ab];[ab][c]xfade=transition=fade:duration=0.5:offset=8[abc];[abc][d]xfade=transition=fade:duration=0.5:offset=12[v]';
  const res = spawnSync(FFMPEG, ['-y', '-loglevel', 'error', ...inputs, '-i', REEL_BGM, '-filter_complex', filter, '-map', '[v]', '-map', '4:a',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', path.join(dir, 'reel.mp4')], { encoding: 'utf8' });
  for (const f of files) fs.rmSync(f, { force: true });
  if (res.error || res.status !== 0) throw new Error(res.error?.message || res.stderr?.trim() || 'ffmpeg が失敗しました');
}

// ---- Instagram のカルーセル（縦長 1080×1350・5 枚） ----
// 1 枚目は表紙（instagram.png と同じ）、2 枚目は 1 行目の文（困りごと・得すること）、3 枚目は要点、4 枚目は記事の目次、5 枚目は保存とプロフィールへの案内
export async function makeInstagramCarousel(post, talk, illus, ads, dir) {
  const W = 1080, H = 1350, L = 80, R = 1000, cx = W / 2;
  const t = (x, y, s, size, color, weight = 700, anchor = 'start') =>
    `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;
  const box = '#fffaf3', line = '#e3d3bf';
  const frame = (body, n) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${C.bg}"/>${body}` +
    t(L, H - 60, 'mise & register', 30, C.muted) + t(R, H - 60, `${n} / 5`, 30, C.muted, 700, 'end') +
    (ads ? `<rect x="${R - 90}" y="50" width="90" height="48" rx="8" fill="none" stroke="${C.muted}" stroke-width="2"/>${t(R - 45, 84, 'PR', 28, C.muted, 700, 'middle')}` : '') + '</svg>');
  const files = [1, 2, 3, 4, 5].map((i) => path.join(dir, `carousel-${i}.png`));

  // 1. 表紙
  await makeInstagramCover(post, illus, files[0]);

  // 2. 1 行目の文（読む人の困りごと・得すること）を大きく。2026-11-28 にマスコットの会話から置き換えた
  const hookRows = wrapJa(talk.hook, Math.floor((R - L) / 68));
  const hookTop = Math.round((H - hookRows.length * 98) / 2) - 40;
  await sharp(frame(`<rect x="${L}" y="${hookTop - 110}" width="120" height="10" fill="${C.accent}"/>` +
    hookRows.map((s, i) => t(L, hookTop + i * 98, s, 68, C.ink, 800)).join('') +
    t(L, hookTop + hookRows.length * 98 + 80, '次の画像から、要点と目次を見られます', 38, C.muted, 600), 2)).png().toFile(files[1]);

  // 3・4. 要点と目次（どちらも「・」の箇条書き。2 行目からは字下げ）
  const listSlide = async (title, items, n, file) => {
    const rows = items.flatMap((s) => wrapJa(s, 17).map((x, i) => (i ? [L + 96, x] : [L + 50, `・${x}`])));
    const rowH = Math.min(80, Math.floor((H - 330 - 120) / Math.max(rows.length, 1)));
    await sharp(frame(t(cx, 170, title, 62, C.ink, 800, 'middle') +
      `<rect x="${L}" y="230" width="${R - L}" height="${80 + rows.length * rowH}" rx="32" fill="${box}" stroke="${line}" stroke-width="3"/>` +
      rows.map(([x, s], i) => t(x, 300 + i * rowH, s, 42, C.ink, 600)).join(''), n)).png().toFile(file);
  };
  await listSlide('この記事で分かること', talk.caption_points.slice(0, 4), 3, files[2]);
  const toc = headings(post.content).filter((h) => !/よくある質問|まとめ|参考/.test(h)).slice(0, 7);
  await listSlide('記事の目次', toc.length ? toc : talk.caption_points.slice(0, 4), 4, files[3]);

  // 5. 保存とプロフィールへの案内
  await sharp(frame(t(cx, 260, 'あとで見返すなら', 70, C.ink, 800, 'middle') + t(cx, 360, '右下の保存ボタンを', 50, C.muted, 600, 'middle') +
    `<rect x="${cx - 400}" y="470" width="800" height="116" rx="58" fill="${C.accent}"/>` + t(cx, 543, 'くわしくはプロフィールのリンクから', 36, '#ffffff', 700, 'middle'), 5))
    .composite([await placePerson(post, 380, 520, cx - 190, 680)]).png().toFile(files[4]);
}

// slug を指定したときはその記事を今日の日付で作る（公開したばかりの記事をすぐ投稿したいとき）
async function makeOne(state, slug) {
  const next = slug
    ? listPosts().find((p) => p.slug === slug)
    : listPosts().find((p) => !state.done.includes(p.slug) && !madeByHand(p.slug));
  if (!next) {
    log(slug ? `記事が見つかりません: ${slug}` : '作っていない記事はありません');
    return false;
  }
  const date = slug ? today() : nextPlannedDate();
  if (DRY_RUN) {
    console.log(`次に作る記事: ${next.slug}（${next.data.title}）／予定日 ${date}`);
    return false;
  }

  let talk;
  try {
    talk = writeTalk(next);
  } catch (err) {
    log(`投稿文の作成に失敗したため、ひな形の文章にします: ${err.message}`);
  }
  talk ??= templateTalk(next);

  const ads = hasAds(next);
  const dir = path.join(OUT_DIR, `${date}-${next.slug}`);
  fs.mkdirSync(dir, { recursive: true });
  const illusFile = path.join(ROOT, 'public', 'images', 'posts', `${next.slug}-1.webp`);
  const illus = fs.existsSync(illusFile) ? illusFile : null;

  const xText = buildXText(next, talk, ads);
  fs.writeFileSync(path.join(dir, 'x.txt'), `${xText}\n`, 'utf8');
  fs.writeFileSync(path.join(dir, 'instagram-caption.txt'), buildCaption(next, talk, ads), 'utf8');
  await makeXImage(next, illus, path.join(dir, 'x.png'));
  await makeInstagramCover(next, illus, path.join(dir, 'instagram.png'));
  fs.writeFileSync(path.join(dir, 'instagram-reel-caption.txt'), buildReelCaption(next, talk, ads), 'utf8');
  try {
    await makeInstagramCarousel(next, talk, illus, ads, dir);
  } catch (err) {
    log(`カルーセルの画像を作れませんでした（ほかはできています）: ${err.message}`);
  }
  try {
    await makeInstagramReel(next, talk, illus, ads, dir);
  } catch (err) {
    log(`リール動画を作れませんでした（画像と文章はできています）: ${err.message}`);
  }

  if (!state.done.includes(next.slug)) state.done.push(next.slug);
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  log(`作成: ${next.slug}（X ${xLength(xText)} / ${X_LIMIT} 文字）→ ${dir}`);
  return true;
}

// 作ってあるフォルダーの x.txt と instagram-caption.txt から 1 行目の文と要点を読み直す
// 2026-11-28 より前の会話の形（レジまる「…」）のファイルは、レジまるのセリフを 1 行目の文として使う
export function readTalkFromFiles(x, cap) {
  const old = x.match(/^レジまる「(.*)」/m)?.[1];
  const firstLine = x.split('\n')[0].trim();
  return {
    hook: old ?? firstLine.replace(/\p{Extended_Pictographic}️?$/u, '').trim(),
    caption_points: [...cap.matchAll(/^・(.+)$/gm)].map((m) => m[1]),
  };
}

// 作ってあるフォルダーの文章から、リール動画だけを作り直す
async function rebuildReels() {
  const dirs = fs.existsSync(OUT_DIR) ? fs.readdirSync(OUT_DIR).filter((d) => /^\d{4}-\d{2}-\d{2}-/.test(d) && d.slice(0, 10) >= today()) : [];
  const posts = listPosts();
  for (const d of dirs) {
    const dir = path.join(OUT_DIR, d);
    const post = posts.find((p) => p.slug === d.slice(11));
    const xFile = path.join(dir, 'x.txt'), capFile = path.join(dir, 'instagram-caption.txt');
    if (!post || !fs.existsSync(xFile) || !fs.existsSync(capFile)) {
      log(`リールの作り直しを飛ばしました: ${d}（記事か文章のファイルが見つかりません）`);
      continue;
    }
    const x = fs.readFileSync(xFile, 'utf8'), cap = fs.readFileSync(capFile, 'utf8');
    const talk = readTalkFromFiles(x, cap);
    const illusFile = path.join(ROOT, 'public', 'images', 'posts', `${post.slug}-1.webp`);
    await makeInstagramReel(post, talk, fs.existsSync(illusFile) ? illusFile : null, /#PR\b/.test(x), dir);
    log(`リールを作り直しました: ${d}`);
  }
}

async function main() {
  const state = readState();
  if (process.argv.includes('--rebuild-reels')) return rebuildReels();
  if (SLUGS.length) {
    for (const slug of SLUGS) await makeOne(state, slug);
    return;
  }
  if (!COUNT && !DRY_RUN) {
    // 毎朝の実行：1 週間先までの分がそろうまで作る（日曜が 2 本なので、1 回に 2 本まで）
    for (let i = 0; i < 2; i++) {
      if (nextPlannedDate() > addDays(today(), STOCK_DAYS)) {
        if (i === 0) log(`${lastPlannedDate()} の分まで用意できているため、今日は作りません`);
        return;
      }
      if (!(await makeOne(state))) return;
    }
    return;
  }
  for (let i = 0; i < (COUNT || 1); i++) if (!(await makeOne(state))) break;
}

// テストから読み込んだときは動かさない（npm run sns:daily で直接動かしたときだけ main を呼ぶ）
const isDirectRun = Boolean(process.argv[1]) && path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (isDirectRun) {
  main().catch((err) => {
    log(`失敗: ${err.message}`);
    process.exit(1);
  });
}
