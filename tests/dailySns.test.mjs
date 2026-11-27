// 毎日の SNS 投稿づくり（scripts/daily-sns.mjs）のテスト：タイトルの収め方・claude -p に渡す環境変数・投稿文の形
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitTitle, claudeEnv, buildXText, buildCaption, buildReelCaption, templateTalk, normalizeTalk, readTalkFromFiles, buildPrompt, xLength } from '../scripts/daily-sns.mjs';

const joined = (lines) => lines.join('');

test('長い副題も、2 行の X 画像にタイトルが全部入る（2026-11-15 に「見やすくする」が切れた例）', () => {
  const title = 'スマレジの商品登録｜品番とグループコードで商品を分けて、売上を見やすくする';
  const { lines, cut } = fitTitle(title, 800, 40, 30, 2);
  assert.equal(cut, false);
  assert.ok(lines.length <= 2);
  assert.equal(joined(lines), title.replace('｜', ''));
});

test('短いタイトルは大きい文字のまま', () => {
  const { lines, size } = fitTitle('キッチンカーの出店あるある6選｜行列の日に限って起きることと対策', 800, 40, 30, 2);
  assert.equal(lines.length, 2);
  assert.ok(size >= 30);
});

test('どうしても入らないときは、黙って切らずに「…」を付ける', () => {
  const { lines, cut } = fitTitle(`長い題｜${'あいうえおかきくけこ'.repeat(12)}`, 800, 40, 30, 2);
  assert.equal(cut, true);
  assert.equal(lines.length, 2);
  assert.ok(lines[1].endsWith('…'));
});

test('claude -p には有料の API キーを渡さない', () => {
  const env = claudeEnv({ PATH: 'x', ANTHROPIC_API_KEY: 'dummy', ANTHROPIC_AUTH_TOKEN: 'dummy', FFMPEG_PATH: 'y' });
  assert.equal(env.ANTHROPIC_API_KEY, undefined);
  assert.equal(env.ANTHROPIC_AUTH_TOKEN, undefined);
  assert.equal(env.PATH, 'x');
  assert.equal(env.FFMPEG_PATH, 'y');
});

// ---- 投稿文の形（2026-11-28 にマスコットの会話をやめ、ふつうの文にした） ----
const post = {
  slug: 'amazon-cheap-pos-register',
  data: { title: 'Amazonの4万円台のPOSレジは買っていい？｜買う前に確かめる5つのこと' },
  content: '## 買う前に確かめる5つのこと\n本文\n## 使えるPOSアプリ\n本文\n## よくある質問\n本文\n',
};
const talk = {
  hook: '4万円台のPOSレジ、買う前に確かめたい5つ',
  hook_deco: '🧾',
  caption_points: ['使いたいPOSアプリに対応しているか', 'レシートプリンターの紙の幅', 'ドロアが一緒に開くか', '保証と問い合わせ先'],
  hashtags: ['#POSレジ', '#開業準備'],
};

test('X の文はセリフの形にせず、1 行目に困りごと・得すること、本文に要点を 2 個入れる', () => {
  const text = buildXText(post, talk, true);
  const lines = text.split('\n');
  assert.equal(lines[0], '4万円台のPOSレジ、買う前に確かめたい5つ🧾');
  assert.doesNotMatch(text, /レジまる|ポスタ|「/);
  assert.match(text, /^・使いたいPOSアプリに対応しているか$/m);
  assert.match(text, /^・レシートプリンターの紙の幅$/m);
  assert.doesNotMatch(text, /ドロアが一緒に開くか/);
  assert.match(text, /https:\/\/\S+\/posts\/amazon-cheap-pos-register/);
  assert.equal(lines.at(-1), '#POSレジ #開業準備 #PR');
});

test('X の文は 280 を超えないように要点を減らす', () => {
  const long = { ...talk, caption_points: ['あ'.repeat(55), 'い'.repeat(55)], hook: 'う'.repeat(35) };
  const text = buildXText(post, long, true);
  assert.ok(xLength(text) <= 280);
  assert.match(text, /^・あ+$/m);
  assert.doesNotMatch(text, /^・い+$/m);
});

test('広告のない記事には #PR を付けない', () => {
  assert.doesNotMatch(buildXText(post, talk, false), /#PR/);
  assert.doesNotMatch(buildCaption(post, talk, false), /#PR/);
});

test('Instagram の投稿文は 1 行目が困りごとの文で、要点と記事のタイトルが入る', () => {
  const cap = buildCaption(post, talk, true);
  assert.equal(cap.split('\n')[0], '4万円台のPOSレジ、買う前に確かめたい5つ🧾');
  assert.doesNotMatch(cap, /レジまる|ポスタ/);
  assert.equal([...cap.matchAll(/^・/gm)].length, 4);
  assert.match(cap, /記事「Amazonの4万円台のPOSレジは買っていい？」/);
  assert.match(cap, /#PR/);
  const reel = buildReelCaption(post, talk, true);
  assert.doesNotMatch(reel, /レジまる|ポスタ/);
  assert.equal([...reel.matchAll(/^・/gm)].length, 2);
});

test('Claude Code が使えないときのひな形も、セリフの形にしない', () => {
  const t = templateTalk(post);
  assert.equal(t.hook, 'Amazonの4万円台のPOSレジは買っていい？');
  assert.deepEqual(t.caption_points, ['買う前に確かめる5つのこと', '使えるPOSアプリ']);
  assert.doesNotMatch(buildXText(post, t, true), /レジまる|ポスタ|記事にまとめました/);
});

test('claude -p の返事を確かめる：絵文字・セリフの形・#PR を受け付けない', () => {
  const ok = normalizeTalk({ hook: ' 開店前に試したい3つ ', hook_deco: '🧾🧾', points: ['a', 'b', 'c'], hashtags: ['POSレジ', '#PR'] });
  assert.equal(ok.hook, '開店前に試したい3つ');
  assert.equal(ok.hook_deco, '');
  assert.deepEqual(ok.caption_points, ['a', 'b', 'c']);
  assert.deepEqual(ok.hashtags, ['#POSレジ']);
  assert.throws(() => normalizeTalk({ hook: 'レジまる「こんにちは」', points: ['a'], hashtags: [] }));
  assert.throws(() => normalizeTalk({ hook: '開店前に🧾', points: ['a'], hashtags: [] }));
  assert.throws(() => normalizeTalk({ hook: '開店前に', points: [], hashtags: [] }));
});

test('claude -p への指示文は、会話ではなくふつうの文を頼む', () => {
  const prompt = buildPrompt(post);
  assert.match(prompt, /"hook"/);
  assert.doesNotMatch(prompt, /"rejimaru"|"posuta"/);
  assert.match(prompt, /記事の本文/);
});

test('リールの作り直しは、前の会話の形のファイルも新しい形のファイルも読める', () => {
  const cap = '▼要点\n・a\n・b\n';
  assert.equal(readTalkFromFiles('レジまる「レジ締めで焦りますよね。」💦\nポスタ「…」\nhttps://x', cap).hook, 'レジ締めで焦りますよね。');
  const now = readTalkFromFiles('開店前に試したい3つ🧾\n\n・a\nhttps://x', cap);
  assert.equal(now.hook, '開店前に試したい3つ');
  assert.deepEqual(now.caption_points, ['a', 'b']);
});
