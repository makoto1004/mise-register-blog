// 毎日の SNS 投稿づくり（scripts/daily-sns.mjs）のタイトルの収め方と、claude -p に渡す環境変数のテスト
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitTitle, claudeEnv } from '../scripts/daily-sns.mjs';

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
