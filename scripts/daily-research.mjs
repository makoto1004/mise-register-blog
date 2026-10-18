// 毎日 18:00 の記事づくり：Claude Code を画面なし（-p）で動かし、上位サイトのリサーチ → 記事 2〜3 本 → 予約（未確認の印付き）を行う
// 指示の内容は scripts/daily-research-prompt.md。タスク スケジューラへの登録は運営者が行う
//
// 使い方: npm run research:daily
//
// - Claude Code のログイン（サブスクリプション）で動く。API キーは使わない
// - 使えるツールは、調べもの（WebSearch・WebFetch・Gemini の CLI）と、scheduled/・logs/ への書き込みだけに絞っている
// - 作った記事には reviewed: false が付き、運営者が確認するまで公開されない（scripts/publish-scheduled.mjs）
// - 実行の記録は logs/daily-research.log、報告は logs/daily-research/YYYY-MM-DD.md

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const LOG_FILE = path.join(ROOT, 'logs', 'daily-research.log');
const prompt = fs.readFileSync(path.join(ROOT, 'scripts', 'daily-research-prompt.md'), 'utf8');

const ALLOWED_TOOLS = [
  'Read',
  'Glob',
  'Grep',
  'WebSearch',
  'WebFetch',
  'Write(./scheduled/**)',
  'Edit(./scheduled/**)',
  'Write(./logs/**)',
  'Edit(./logs/**)',
  'Bash(gemini --skip-trust:*)',
  'Bash(npm run publish:scheduled -- --dry)',
];

function log(message) {
  const line = `[${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}] ${message}`;
  console.log(line);
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  fs.appendFileSync(LOG_FILE, `${line}\n`);
}

fs.mkdirSync(path.join(ROOT, 'logs', 'daily-research'), { recursive: true });
log('開始');
const result = spawnSync('claude', ['-p', prompt, '--allowedTools', ...ALLOWED_TOOLS], {
  cwd: ROOT,
  encoding: 'utf8',
  timeout: 60 * 60 * 1000,
  maxBuffer: 50 * 1024 * 1024,
});

if (result.error) {
  log(`失敗: Claude Code を起動できませんでした（${result.error.message}）`);
  process.exit(1);
}
const output = (result.stdout ?? '').trim();
if (output) fs.appendFileSync(LOG_FILE, `${output}\n`);
if (result.status !== 0) {
  log(`失敗: 終了コード ${result.status}（${(result.stderr ?? '').trim().split('\n')[0]}）`);
  process.exit(1);
}
log('終了');
