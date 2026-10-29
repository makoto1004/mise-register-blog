// 毎日 1 本、公開ずみの記事から SNS 投稿用のファイル（X の画像と文章、Instagram の表紙・リール動画と投稿文）を作る
// 投稿は自動ではしない。運営者が中身を確かめてから、X・Instagram の画面から手で投稿する
//
// 使い方:
//   npm run sns:daily            # 次の 1 本を作る
//   npm run sns:daily -- --dry   # 次にどの記事を作るかを表示するだけ
//   npm run sns:daily -- --count 7  # 7 本まとめて作る
//   npm run sns:daily -- --slug cafe-cup-warmer,cafe-latte-art  # 記事を指定して、今日の日付で作る
//
// - フォルダー名には投稿する予定の日付をつける（すでにある最後の日付の次の日から、1 日 1 本）
// - 毎朝の実行では、1 週間先（今日から 6 日後）まで用意できていれば何もしない
//
// - 古い記事から順に作る。作った記事は logs/daily-sns.json に記録し、2 回作らない
// - 保存先の SNS投稿 フォルダーに x-<slug>.png か instagram-<slug>/ がある記事は、手で作ったものとみなして飛ばす
// - 2 人の会話の文章は Claude Code（claude -p）で作る。有料の Claude API は使わない
//   Claude Code が使えないときは、記事のタイトルを使ったひな形の文章にする
// - 保存先は SNS_OUT_DIR（.env.local）。なければ OneDrive のデスクトップの「SNS投稿\毎日」
// - 結果は logs/daily-sns.log に残る

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import matter from 'gray-matter';
import sharp from 'sharp';
import { spawnSync } from 'node:child_process';
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

// 保存先にある最後の予定日（フォルダー名の先頭の日付）
function lastPlannedDate() {
  if (!fs.existsSync(OUT_DIR)) return null;
  const dates = fs.readdirSync(OUT_DIR).map((n) => n.slice(0, 10)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  return dates.at(-1) ?? null;
}
// 次の予定日：今日か、最後の予定日の次の日の、遅いほう
function nextPlannedDate() {
  const last = lastPlannedDate();
  const t = today();
  return last && last >= t ? addDays(last, 1) : t;
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
function xLength(text) {
  let n = 0;
  for (const ch of text.replace(/https?:\/\/\S+/g, 'x'.repeat(23))) {
    const c = ch.codePointAt(0);
    n += c <= 0x10ff || (c >= 0x2000 && c <= 0x200d) || (c >= 0x2010 && c <= 0x201f) || (c >= 0x2032 && c <= 0x2037) ? 1 : 2;
  }
  return n;
}

const SYSTEM_PROMPT = `あなたは、小さなお店向けのブログ「mise & register」の SNS 投稿の文章を書きます。
ブログのマスコット 2 人が、記事を紹介する会話を書いてください。
- レジまる：レシートプリンターから生まれたキャラクター。プリンター・キャッシュドロア・バーコードリーダーの担当
- ポスタ：タブレットの POS レジのキャラクター。POS レジ・キャッシュレス決済・お店の Wi-Fi の担当
決まり:
- やさしい「です・ます」で書く。くだけた話し方、語尾の「〜まる」、絵文字は使わない
- 記事に書かれていることだけを書く。記事にない数字・効果・体験談を足さない
- 「必ず」「絶対」「いちばん安い」のような言い切りはしない
- rejimaru：記事が役に立つ場面や、読む人の困りごとを 1〜2 文で（45 文字以内）
- posuta：記事で分かることを 1〜2 文で（55 文字以内）
- caption_points：Instagram の投稿文に入れる、記事の要点を 3〜4 個（1 個 30 文字以内）
- hashtags：記事に合うハッシュタグを 2 個（# をつける。#PR は入れない）`;

// 記事の見出し（## の行）を集める。会話を作るときの材料にする
const headings = (content) => [...content.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]).slice(0, 12);

// Claude Code に会話を書いてもらう（ツールは使わせない）
function writeTalk(post) {
  const prompt = `${SYSTEM_PROMPT}

次の記事を紹介する文章を、JSON だけで返してください（前後に説明やコードブロックの記号をつけない）。
形: {"rejimaru": "...", "posuta": "...", "caption_points": ["..."], "hashtags": ["#...", "#..."]}

記事のタイトル: ${post.data.title}
記事の説明: ${post.data.description ?? ''}
見出し:
${headings(post.content).map((h) => `- ${h}`).join('\n')}`;
  const result = spawnSync('claude', ['-p', prompt], { cwd: ROOT, encoding: 'utf8', timeout: 10 * 60 * 1000 });
  if (result.error) throw new Error(`Claude Code を起動できませんでした（${result.error.message}）`);
  if (result.status !== 0) throw new Error(`終了コード ${result.status}（${(result.stderr ?? '').trim().split('\n')[0]}）`);
  const json = (result.stdout ?? '').match(/\{[\s\S]*\}/);
  if (!json) throw new Error('返ってきた文章が JSON ではありません');
  const talk = JSON.parse(json[0]);
  if (!talk.rejimaru || !talk.posuta || !Array.isArray(talk.caption_points) || !Array.isArray(talk.hashtags)) throw new Error('返ってきた JSON の形が違います');
  // 絵文字の入った文章は使わない
  if (/\p{Extended_Pictographic}/u.test(talk.rejimaru + talk.posuta)) throw new Error('絵文字の入った文章が返ってきました');
  // ハッシュタグは「#」をつけ、#PR は広告のある記事だけにあとでつける
  talk.hashtags = talk.hashtags.map((t) => `#${String(t).replace(/^#/, '').trim()}`).filter((t) => t !== '#' && t !== '#PR');
  return talk;
}

// Claude Code が使えないときのひな形
function templateTalk(post) {
  // 記事の説明文は「〜を解説。」のような言い切りもあるので、タイトルから「です・ます」の文を作る
  const [main, sub] = String(post.data.title).split('｜');
  return {
    rejimaru: `『${main}』について、記事にまとめました。`,
    posuta: sub ? `${sub}を紹介しています。くわしくは、ブログの記事でどうぞ。` : 'くわしくは、ブログの記事にまとめています。',
    caption_points: headings(post.content).filter((h) => !/よくある質問|まとめ|参考/.test(h)).slice(0, 4),
    hashtags: ['#小さなお店', '#開業準備'],
  };
}

function buildXText(post, talk, ads) {
  // パソコンで動かすと SITE.url が仮の URL になることがあるため、そのときは本番の URL を使う
  const base = SITE.url.includes('example.com') ? 'https://www.mise-register.com' : SITE.url.replace(/\/$/, '');
  const url = `${base}/posts/${post.slug}`;
  const tags = [...talk.hashtags.slice(0, 2), ...(ads ? ['#PR'] : [])].join(' ');
  const full = `レジまる「${talk.rejimaru}」\nポスタ「${talk.posuta}」\n${url}\n${tags}`;
  if (xLength(full) <= X_LIMIT) return full;
  // 長すぎるときは、ポスタのひとことを短くする
  return `レジまる「${talk.rejimaru}」\nポスタ「くわしくは、ブログの記事で紹介しています」\n${url}\n${tags}`;
}

function buildCaption(post, talk, ads) {
  const tags = [...talk.hashtags, '#小さなお店', '#お店づくり', '#開業準備', ...(ads ? ['#PR'] : [])];
  return `レジまる「${talk.rejimaru}」

ポスタ「${talk.posuta}」

▼この記事で分かること
${talk.caption_points.map((p) => `・${p}`).join('\n')}

あとで見返せるように、保存しておいてください。
記事は、プロフィールのリンク（mise & register）から見られます。

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
const mascot = (name) => path.join(ROOT, 'public', 'images', 'mascots', `${name}.webp`);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// タイトルを「｜」で行に分ける。いちばん長い行が幅に収まるように文字を小さくし、それでも長い行は折り返す
function fitTitle(title, width, maxSize, minSize, maxLines) {
  const parts = String(title).split('｜');
  const size = Math.max(minSize, Math.min(maxSize, Math.floor(width / Math.max(...parts.map((p) => p.length)))));
  const perLine = Math.floor(width / size);
  const lines = [];
  for (const part of parts) for (let i = 0; i < part.length; i += perLine) lines.push(part.slice(i, i + perLine));
  return { lines: lines.slice(0, maxLines), size };
}
const textLines = (lines, x, y, size, lh, opt = '') =>
  lines.map((t, i) => `<text x="${x}" y="${y + i * lh}" font-size="${size}" ${opt}>${esc(t)}</text>`).join('');

async function makeXImage(post, illus, file) {
  const { lines, size } = fitTitle(post.data.title, 800, 40, 30, 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><rect width="1200" height="675" fill="${C.bg}"/>
<g font-family="${FONT}" fill="${C.ink}">${textLines(lines, 60, 80, size, Math.round(size * 1.45), 'font-weight="800"')}</g>
<rect x="60" y="160" width="90" height="6" fill="${C.accent}"/></svg>`;
  const layers = [await put(mascot('rejimaru'), 150, 150, 880, 20), await put(mascot('posuta'), 150, 150, 1030, 20)];
  if (illus) layers.push(await put(illus, 860, 482, 340, 193));
  await sharp(Buffer.from(svg)).composite(layers).png().toFile(file);
}

async function makeInstagramCover(post, illus, file) {
  const { lines, size } = fitTitle(post.data.title, 920, 62, 46, 3);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect width="1080" height="1350" fill="${C.bg}"/>
<g font-family="${FONT}" fill="${C.ink}">
${textLines(lines, 80, 860, size, Math.round(size * 1.4), 'font-weight="800"')}
<rect x="80" y="1110" width="120" height="8" fill="${C.accent}"/>
<text x="80" y="1290" font-size="30" fill="${C.muted}" font-weight="700">mise &amp; register</text></g></svg>`;
  const layers = [await put(mascot('rejimaru'), 140, 140, 720, 1080), await put(mascot('posuta'), 140, 140, 860, 1080)];
  if (illus) layers.unshift(await put(illus, 1080, 606, 0, 160));
  await sharp(Buffer.from(svg)).composite(layers).png().toFile(file);
}

// ---- Instagram のリール動画（縦長 1080×1920・4 場面・BGM 付き・16 秒） ----
// ffmpeg の場所は FFMPEG_PATH（.env.local）。なければ PATH の ffmpeg を使う。見つからないときは動画を作らずに飛ばす
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const REEL_BGM = path.join(ROOT, 'scripts', 'assets', 'reel-bgm.m4a');
const RW = 1080, RH = 1920;

// 日本語を全角 n 文字分の幅で折り返す（半角は 0.55 文字分）。読点のあとで切れるならそこで切り、
// 英数字の途中では切らず、句読点は行の頭に来ないようにする
function wrapJa(str, n) {
  const w = (ch) => (/[\x20-\x7e]/.test(ch) ? 0.55 : 1);
  const word = /[A-Za-z0-9]/;
  const out = [];
  let rest = String(str);
  while ([...rest].reduce((s, ch) => s + w(ch), 0) > n) {
    let k = 0, width = 0;
    while (k < rest.length && width + w(rest[k]) <= n) width += w(rest[k++]);
    const comma = rest.lastIndexOf('、', k - 1);
    if (comma >= Math.floor(k / 2)) k = comma + 1;
    else while (k > 1 && word.test(rest[k]) && word.test(rest[k - 1])) k--;
    while (k < rest.length && '。、」？！）'.includes(rest[k])) k++;
    out.push(rest.slice(0, k));
    rest = rest.slice(k);
  }
  if (rest) out.push(rest);
  return out;
}

async function makeReelFrames(post, talk, illus, ads, dir) {
  const t = (x, y, s, size, color, weight = 700, anchor = 'start') =>
    `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;
  const brand = t(RW / 2, 1820, 'mise & register', 40, C.muted, 700, 'middle');
  const pr = ads ? `<rect x="900" y="120" width="100" height="52" rx="8" fill="none" stroke="${C.muted}" stroke-width="2"/>${t(950, 157, 'PR', 30, C.muted, 700, 'middle')}` : '';
  const frame = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${RW}" height="${RH}"><rect width="${RW}" height="${RH}" fill="${C.bg}"/>${body}</svg>`);
  const files = [1, 2, 3, 4].map((i) => path.join(dir, `reel-${i}.png`));
  const box = '#fffaf3', line = '#e3d3bf';

  // 1. タイトルと挿絵
  const { lines, size } = fitTitle(post.data.title, 920, 84, 60, 4);
  const lh = Math.round(size * 1.35);
  const layers1 = illus ? [await put(illus, 1000, 562, 40, 260 + lines.length * lh + 60)] : [];
  await sharp(frame(t(80, 200, '新しい記事', 44, C.accent) + pr + textLines(lines, 80, 260 + size, size, lh, `font-family="${FONT}" font-weight="800" fill="${C.ink}"`) + brand))
    .composite(layers1).png().toFile(files[0]);

  // 2. 2 人の会話
  const bubble = (y, n) => `<rect x="300" y="${y}" width="720" height="${140 + n * 62}" rx="28" fill="${box}" stroke="${line}" stroke-width="3"/>`;
  const r = wrapJa(talk.rejimaru, 13), p = wrapJa(talk.posuta, 13);
  await sharp(frame(bubble(330, r.length) + t(340, 400, 'レジまる', 38, C.accent) + r.map((s, i) => t(340, 470 + i * 62, s, 46, C.ink, 600)).join('') +
    bubble(1000, p.length) + t(340, 1070, 'ポスタ', 38, C.accent) + p.map((s, i) => t(340, 1140 + i * 62, s, 44, C.ink, 600)).join('') + brand))
    .composite([await put(mascot('rejimaru'), 220, 220, 50, 360), await put(mascot('posuta'), 220, 220, 50, 1030)]).png().toFile(files[1]);

  // 3. この記事で分かること
  // 2 行目からは「・」のぶん字下げする
  const points = talk.caption_points.slice(0, 4).flatMap((s) => wrapJa(s, 16).map((x, i) => (i ? [176, x] : [130, `・${x}`])));
  await sharp(frame(t(RW / 2, 400, 'この記事で分かること', 76, C.ink, 700, 'middle') +
    `<rect x="80" y="520" width="920" height="${120 + points.length * 92}" rx="32" fill="${box}" stroke="${line}" stroke-width="3"/>` +
    points.map(([x, s], i) => t(x, 620 + i * 92, s, 46, C.ink, 600)).join('') + brand)).png().toFile(files[2]);

  // 4. 締め
  await sharp(frame(t(RW / 2, 380, 'くわしくは記事で', 92, C.ink, 700, 'middle') +
    t(RW / 2, 520, 'ブログ「mise & register」に', 48, C.muted, 600, 'middle') + t(RW / 2, 596, 'まとめています', 48, C.muted, 600, 'middle') +
    `<rect x="190" y="720" width="700" height="120" rx="60" fill="${C.accent}"/>` + t(RW / 2, 798, 'プロフィールのリンクから', 46, '#ffffff', 700, 'middle') +
    (ads ? t(RW / 2, 1600, 'この投稿には広告（PR）を含む記事の紹介があります', 30, C.muted, 500, 'middle') : '') + brand))
    .composite([await put(mascot('rejimaru'), 300, 300, 200, 1050), await put(mascot('posuta'), 300, 300, 580, 1050)]).png().toFile(files[3]);
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
    log(`会話の作成に失敗したため、ひな形の文章にします: ${err.message}`);
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

async function main() {
  const state = readState();
  if (SLUGS.length) {
    for (const slug of SLUGS) await makeOne(state, slug);
    return;
  }
  if (!COUNT && !DRY_RUN) {
    const last = lastPlannedDate();
    if (last && last >= addDays(today(), STOCK_DAYS)) {
      log(`${last} の分まで用意できているため、今日は作りません`);
      return;
    }
  }
  for (let i = 0; i < (COUNT || 1); i++) if (!(await makeOne(state))) break;
}

main().catch((err) => {
  log(`失敗: ${err.message}`);
  process.exit(1);
});
