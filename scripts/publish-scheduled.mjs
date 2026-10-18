// 予約公開：scheduled/ に置いた記事のうち、publishAt の時刻を過ぎたものを content/posts/ に移してプッシュする
// 毎日 8:00 / 12:00 / 18:00 にタスク スケジューラから実行する想定（タスクの登録は運営者が行う）
//
// 使い方:
//   npm run publish:scheduled          # 時刻を過ぎた記事を公開する
//   npm run publish:scheduled -- --dry # 公開予定の一覧を表示するだけ（移動・プッシュしない）
//
// - scheduled/ は .gitignore 済み。公開前の記事は GitHub に上がらない
// - 記事のフロントマターに publishAt: 2026-10-18T12:00 のように書く（日本時間）
// - 公開時に date を公開日に書き換え、publishAt は publishedAt（公開した日時）に書き換える
// - PC が止まっていて時刻を過ぎた記事は、次に実行したときにまとめて公開される
// - 結果は logs/publish-scheduled.log に残る

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';

const ROOT = process.cwd();
const SCHEDULED_DIR = path.join(ROOT, 'scheduled');
const POSTS_DIR = path.join(ROOT, 'content', 'posts');
const LOG_FILE = path.join(ROOT, 'logs', 'publish-scheduled.log');
const DRY_RUN = process.argv.includes('--dry');

function log(message) {
  const line = `[${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}] ${message}`;
  console.log(line);
  if (DRY_RUN) return;
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  fs.appendFileSync(LOG_FILE, `${line}\n`);
}

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();

// publishAt（日本時間の「YYYY-MM-DDTHH:mm」）を Date にする
function parsePublishAt(value) {
  const text = value instanceof Date ? value.toISOString().slice(0, 16) : String(value ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(text)) return null;
  // YAML が Date として読んだ場合は UTC 扱いになっているので、日本時間として読み直す
  return { text, date: new Date(`${text}:00+09:00`) };
}

if (!fs.existsSync(SCHEDULED_DIR)) {
  log('予約の記事はありません（scheduled/ がありません）');
  process.exit(0);
}

const now = new Date();
const entries = fs
  .readdirSync(SCHEDULED_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((file) => {
    const raw = fs.readFileSync(path.join(SCHEDULED_DIR, file), 'utf8');
    const { data } = matter(raw);
    return { file, raw, title: data.title, publishAt: parsePublishAt(data.publishAt) };
  })
  .sort((a, b) => (a.publishAt?.text ?? '').localeCompare(b.publishAt?.text ?? ''));

for (const e of entries) {
  if (!e.publishAt) log(`スキップ: ${e.file}（publishAt が「2026-10-18T12:00」の形ではありません）`);
}

const due = entries.filter((e) => e.publishAt && e.publishAt.date <= now);
if (DRY_RUN) {
  for (const e of entries.filter((x) => x.publishAt)) {
    console.log(`${e.publishAt.text}  ${e.publishAt.date <= now ? '公開する' : '待ち'}  ${e.file}  ${e.title}`);
  }
  process.exit(0);
}
if (due.length === 0) {
  log('公開時刻を過ぎた記事はありません');
  process.exit(0);
}

for (const e of due) {
  const dest = path.join(POSTS_DIR, e.file);
  if (fs.existsSync(dest)) {
    log(`スキップ: ${e.file}（content/posts/ に同じ名前の記事があります）`);
    continue;
  }
  const crlf = e.raw.includes('\r\n');
  let text = e.raw.replace(/\r\n/g, '\n');
  // 公開日を date に入れ、publishAt を publishedAt（公開した日時。同じ日の記事の並び順に使う）に書き換える
  text = text
    .replace(/^date:.*$/m, `date: ${e.publishAt.text.slice(0, 10)}`)
    .replace(/^publishAt:.*$/m, `publishedAt: ${e.publishAt.text}`);
  if (crlf) text = text.replace(/\n/g, '\r\n');
  fs.writeFileSync(dest, text);
  fs.unlinkSync(path.join(SCHEDULED_DIR, e.file));

  const rel = path.relative(ROOT, dest).replace(/\\/g, '/');
  try {
    git('add', '--', rel);
    git('commit', '-m', `記事を公開: ${e.title}`, '--', rel);
    log(`コミット: ${rel}`);
  } catch (error) {
    log(`失敗: ${rel} のコミットに失敗しました（${error.message.split('\n')[0]}）`);
    process.exit(1);
  }
}

try {
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  git('push', 'origin', branch);
  log(`プッシュしました（${due.length} 件）`);
} catch (error) {
  log(`失敗: プッシュに失敗しました。次回の実行か、手動の git push で公開されます（${error.message.split('\n')[0]}）`);
  process.exit(1);
}
