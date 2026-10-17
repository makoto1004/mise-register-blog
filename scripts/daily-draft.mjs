// keywords.txt の先頭のキーワードを 1 つ取り出して記事の下書きを生成し、drafts/ に保存する
// 毎朝 7 時にタスク スケジューラから実行する想定（scripts/register-daily-task.ps1 で登録）
//
// 使い方（手動で試すとき）:
//   npm run draft:daily
//
// keywords.txt の書き方（1 行 1 記事。# で始まる行と空行は無視）:
//   スマレジ 周辺機器 Amazon
//   キッチンカー 電源 | kitchen-car     ← 「| カテゴリー」でカテゴリーを指定できる
//
// 成功したキーワードは keywords.txt から消え、logs/daily-draft.log に記録される。
// 失敗したときはキーワードを残すので、翌朝もう一度試される。

import fs from 'node:fs';
import path from 'node:path';
import {
  CATEGORY_SLUGS,
  DRAFTS_DIR,
  buildMarkdown,
  generateArticle,
  resolveDraftPath,
  today,
} from './generate-draft.mjs';

const QUEUE_FILE = path.join(process.cwd(), 'keywords.txt');
const LOG_FILE = path.join(process.cwd(), 'logs', 'daily-draft.log');

// 画面とログファイルの両方に書く（タスク スケジューラ実行時は画面が見えないため）
function log(message) {
  const line = `[${new Date().toLocaleString('ja-JP')}] ${message}`;
  console.log(line);
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  fs.appendFileSync(LOG_FILE, `${line}\n`, 'utf8');
}

const isKeywordLine = (line) => line.trim() !== '' && !line.trim().startsWith('#');

// 「キーワード | カテゴリー」の 1 行を分解する
function parseQueueLine(line) {
  const [keyword, category = ''] = line.split('|').map((s) => s.trim());
  return { keyword, category: category || undefined };
}

async function main() {
  const tag = process.env.NEXT_PUBLIC_AMAZON_TAG ?? '';
  if (!process.env.ANTHROPIC_API_KEY) {
    log('失敗: .env.local に ANTHROPIC_API_KEY がありません');
    process.exit(1);
  }
  if (!tag) {
    log('失敗: .env.local に NEXT_PUBLIC_AMAZON_TAG がありません');
    process.exit(1);
  }
  if (!fs.existsSync(QUEUE_FILE)) {
    log('スキップ: keywords.txt がありません');
    return;
  }

  const lines = fs.readFileSync(QUEUE_FILE, 'utf8').split(/\r?\n/);
  const index = lines.findIndex(isKeywordLine);
  if (index === -1) {
    log('スキップ: keywords.txt に未処理のキーワードがありません');
    return;
  }

  const { keyword, category } = parseQueueLine(lines[index]);
  if (category && !CATEGORY_SLUGS.includes(category)) {
    log(`失敗: 「${keyword}」のカテゴリー「${category}」が不正です（${CATEGORY_SLUGS.join(' / ')}）`);
    process.exit(1);
  }

  log(`開始: 「${keyword}」の下書きを生成します`);
  let article;
  try {
    article = await generateArticle({ keyword, category });
  } catch (error) {
    log(`失敗: 「${keyword}」 ${error.status ? `（API ${error.status}）` : ''}${error.message}`);
    process.exit(1);
  }

  const markdown = buildMarkdown({ article, keyword, tag, date: today() });
  fs.mkdirSync(DRAFTS_DIR, { recursive: true });
  const filePath = resolveDraftPath(article.slug);
  fs.writeFileSync(filePath, markdown, 'utf8');

  // 下書きを保存できてから、キーワードを一覧から消す
  lines.splice(index, 1);
  fs.writeFileSync(QUEUE_FILE, lines.join('\n'), 'utf8');

  const remaining = lines.filter(isKeywordLine).length;
  log(`完了: ${path.relative(process.cwd(), filePath)}「${article.title}」（要確認 ${article.reviewNotes.length} 件、残りキーワード ${remaining} 件）`);
}

main();
