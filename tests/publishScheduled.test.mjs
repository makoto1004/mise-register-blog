// 予約公開（scripts/publish-scheduled.mjs）が、GitHub 側が先に進んでいても送れるかを、手元の仮のリポジトリで試す
// 本物の GitHub には何も送らない（仮の「origin」は一時フォルダーの bare リポジトリ）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'publish-scheduled.mjs');

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' }).trim();

// origin（bare）と、それを複製した 2 つのフォルダー（ブログ役・別のセッション役）を作る
function setup() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-test-'));
  const origin = path.join(base, 'origin.git');
  git(base, 'init', '--bare', '-b', 'main', origin);
  const blog = path.join(base, 'blog');
  git(base, 'clone', origin, blog);
  for (const dir of [blog]) {
    git(dir, 'config', 'user.name', 'test');
    git(dir, 'config', 'user.email', 'test@example.com');
  }
  fs.mkdirSync(path.join(blog, 'content', 'posts'), { recursive: true });
  fs.writeFileSync(path.join(blog, 'content', 'posts', 'old.md'), '---\ntitle: old\n---\n');
  fs.writeFileSync(path.join(blog, '.gitignore'), 'scheduled/\nlogs/\n');
  git(blog, 'add', '.');
  git(blog, 'commit', '-m', 'first');
  git(blog, 'push', '-u', 'origin', 'main');
  const other = path.join(base, 'other');
  git(base, 'clone', origin, other);
  git(other, 'config', 'user.name', 'test');
  git(other, 'config', 'user.email', 'test@example.com');
  return { base, origin, blog, other };
}

function schedule(blog, name) {
  fs.mkdirSync(path.join(blog, 'scheduled'), { recursive: true });
  fs.writeFileSync(path.join(blog, 'scheduled', name), `---\ntitle: ${name}\ndate: 2026-01-01\npublishAt: 2026-01-01T12:00\n---\n本文\n`);
}

// 別のセッションが先に GitHub に送った、という状態を作る
function otherSessionPushes(other) {
  fs.writeFileSync(path.join(other, 'tagline.txt'), 'キャッチコピー\n');
  git(other, 'add', '.');
  git(other, 'commit', '-m', 'other change');
  git(other, 'push', 'origin', 'main');
}

const run = (cwd) => spawnSync(process.execPath, [SCRIPT], { cwd, encoding: 'utf8' });
const originFiles = (origin) => git(origin, 'ls-tree', '-r', '--name-only', 'main').split('\n');

test('GitHub 側が先に進んでいても、取り込んでから記事を送る', () => {
  const { blog, other, origin } = setup();
  otherSessionPushes(other);
  schedule(blog, 'new-post.md');
  const r = run(blog);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const files = originFiles(origin);
  assert.ok(files.includes('content/posts/new-post.md'), '記事が GitHub に届いている');
  assert.ok(files.includes('tagline.txt'), '別のセッションの変更も残っている');
  assert.match(fs.readFileSync(path.join(blog, 'logs', 'publish-scheduled.log'), 'utf8'), /取り込みました/);
});

test('公開する記事がなくても、前の回に送れなかったコミットを送る', () => {
  const { blog, other, origin } = setup();
  fs.writeFileSync(path.join(blog, 'content', 'posts', 'left.md'), '---\ntitle: left\n---\n');
  git(blog, 'add', '.');
  git(blog, 'commit', '-m', 'left over');
  otherSessionPushes(other);
  const r = run(blog);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(originFiles(origin).includes('content/posts/left.md'));
  assert.match(fs.readFileSync(path.join(blog, 'logs', 'publish-scheduled.log'), 'utf8'), /送れなかったコミット 1 件/);
});

test('main 以外のブランチでは、記事を動かさずに止まる', () => {
  const { blog, origin } = setup();
  git(blog, 'switch', '-c', 'work');
  schedule(blog, 'new-post.md');
  const r = run(blog);
  assert.equal(r.status, 1);
  assert.ok(fs.existsSync(path.join(blog, 'scheduled', 'new-post.md')), '記事は scheduled に残る');
  assert.ok(!originFiles(origin).includes('content/posts/new-post.md'));
});
