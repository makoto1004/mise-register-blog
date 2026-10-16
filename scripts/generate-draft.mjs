// キーワードから SEO を意識したアフィリエイト記事の下書きを生成し、drafts/ に保存する
//
// 使い方:
//   npm run draft -- "スマレジ 周辺機器 Amazon"
//   npm run draft -- "スマレジ 周辺機器 Amazon" --category guide --tag yourname-22
//
// 必要な環境変数（.env.local に書く）:
//   ANTHROPIC_API_KEY       Claude API のキー
//   NEXT_PUBLIC_AMAZON_TAG  Amazon アソシエイトのトラッキング ID（--tag で上書き可）

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import matter from 'gray-matter';
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-5-5';
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
export const DRAFTS_DIR = path.join(process.cwd(), 'drafts');
// lib/site.js の CATEGORIES と合わせる
export const CATEGORY_SLUGS = ['cafe', 'salon', 'kitchen-car', 'apparel', 'devices'];

// Claude に返させる記事データの形（構造化出力の JSON Schema）
const ARTICLE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'slug', 'description', 'category', 'tags', 'body', 'products', 'reviewNotes'],
  properties: {
    title: { type: 'string', description: '記事タイトル。32文字前後、メインキーワードを前半に含める' },
    slug: { type: 'string', description: 'URL 用の英小文字・数字・ハイフンのみの slug' },
    description: { type: 'string', description: 'メタディスクリプション。80〜120文字、キーワードを自然に含める' },
    category: { type: 'string', enum: CATEGORY_SLUGS },
    tags: { type: 'array', items: { type: 'string' }, description: '3〜5個' },
    body: {
      type: 'string',
      description:
        'Markdown 本文。H1 は書かず H2 から始める。製品の比較表・紹介カードを入れたい位置に <!-- products --> を1回だけ書く',
    },
    products: {
      type: 'array',
      description: '紹介する製品・製品タイプ（3〜5個）。ASIN は書かない',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'keyword', 'badge', 'summary', 'specs', 'pros', 'cons'],
        properties: {
          name: { type: 'string' },
          keyword: { type: 'string', description: 'Amazon で検索するときのキーワード' },
          badge: { type: 'string', description: '「迷ったらこれ」など短いラベル。なければ空文字' },
          summary: { type: 'string' },
          specs: {
            type: 'array',
            description: '比較表の列。全製品で同じ label をそろえる',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['label', 'value'],
              properties: { label: { type: 'string' }, value: { type: 'string' } },
            },
          },
          pros: { type: 'array', items: { type: 'string' } },
          cons: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    reviewNotes: {
      type: 'array',
      items: { type: 'string' },
      description: '公開前に人が事実確認すべき記述（仕様・対応状況・数値など）',
    },
  },
};

const SYSTEM_PROMPT = `あなたは POS レジ周辺機器に詳しい日本語の SEO ライターです。
Amazon アソシエイトを使う比較ブログの記事を書きます。

## SEO の方針
- 検索意図（その言葉で検索する人が知りたいこと）を最初に考え、冒頭の数行で結論を示す
- タイトルはメインキーワードを前半に入れ、32文字前後にする
- H2・H3 の見出しに関連キーワード（サジェストされやすい言葉）を自然に入れる。キーワードの詰め込みはしない
- 構成は「導入（結論）→ 選び方 → <!-- products --> → よくある質問 → まとめ」を基本にする
- 「よくある質問」は H2 にし、質問を H3 で3つ以上書く
- 関連する既存記事があれば、本文中で [記事タイトル](/posts/slug) の形で内部リンクする

## 事実と表記のルール
- 価格・セール情報・在庫は書かない（変動するため。Amazon の規約上も固定の価格表示はできない）
- ASIN や型番を推測で作らない。確信がない製品は「〇〇タイプ」のような製品タイプとして紹介する
- 仕様や POS アプリの対応状況は、確信がある内容だけを書き、必ず reviewNotes に確認項目として挙げる
- 「購入前に POS アプリ公式の対応機種一覧を確認する」旨を本文に入れる
- 誇大表現（「絶対」「最強」「No.1」など根拠のない表現）は使わない
- 文体は「です・ます」調`;

// 今日の日付（ローカル時刻）を YYYY-MM-DD で返す
export function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 内部リンクの候補として、既存記事のタイトルと slug を集める
function listExistingPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'));
      return { slug: file.replace(/\.md$/, ''), title: data.title ?? '' };
    });
}

function buildUserPrompt(keyword, category, existingPosts) {
  const postList = existingPosts.length
    ? existingPosts.map((p) => `- ${p.title}（/posts/${p.slug}）`).join('\n')
    : '（まだありません）';
  return `次のメインキーワードで、アフィリエイト比較記事を書いてください。

メインキーワード: ${keyword}
${category ? `カテゴリー: ${category}（この値を category に入れる）` : `カテゴリー: ${CATEGORY_SLUGS.join(' / ')} から最も合うもの`}

既存記事（内部リンクの候補）:
${postList}`;
}

// Claude API で記事データ（JSON）を生成する
export async function generateArticle({ keyword, category }) {
  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    // 安全上の理由で断られた場合に、サーバー側で別モデルに自動で切り替える
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: {
      effort: 'high',
      format: { type: 'json_schema', schema: ARTICLE_SCHEMA },
    },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(keyword, category, listExistingPosts()) }],
  });
  const message = await stream.finalMessage();

  if (message.stop_reason === 'refusal') {
    throw new Error(`生成を断られました: ${message.stop_details?.explanation ?? '理由不明'}`);
  }
  if (message.stop_reason === 'max_tokens') {
    throw new Error('出力が上限に達して途中で切れました。max_tokens を増やしてください');
  }
  const text = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');
  return JSON.parse(text);
}

// Amazon の検索リンク（トラッキング ID 付き）を作る
export function buildAmazonSearchUrl(keyword, tag) {
  const url = new URL('https://www.amazon.co.jp/s');
  url.searchParams.set('k', keyword);
  url.searchParams.set('tag', tag);
  return url.toString();
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// 記事の最後に差し込む Amazon ボタンの HTML
export function buildAmazonButtonsHtml({ keyword, products, tag }) {
  const link = (href, label) =>
    `  <a class="amazon-button" href="${escapeHtml(href)}" target="_blank" rel="sponsored nofollow noopener">${escapeHtml(label)}</a>`;
  const buttons = [
    ...products.map((p) => link(buildAmazonSearchUrl(p.keyword, tag), `${p.name}をAmazonで見る`)),
    link(buildAmazonSearchUrl(keyword, tag), `「${keyword}」をAmazonで探す`),
  ];
  return [
    '<div class="affiliate-buttons">',
    '  <p class="affiliate-buttons-title">この記事で紹介した製品をAmazonで見る</p>',
    ...buttons,
    '</div>',
  ].join('\n');
}

// 生成データを、このブログのフロントマター形式の Markdown に変換する
export function buildMarkdown({ article, keyword, tag, date }) {
  const products = article.products.map((p) => ({
    name: p.name,
    keyword: p.keyword,
    ...(p.badge ? { badge: p.badge } : {}),
    summary: p.summary,
    specs: Object.fromEntries(p.specs.map((s) => [s.label, s.value])),
    pros: p.pros,
    cons: p.cons,
  }));
  const frontmatter = {
    title: article.title,
    date,
    category: article.category,
    tags: article.tags,
    description: article.description,
    keyword,
    // 公開前の確認事項（ブログの表示には使われない）
    reviewNotes: article.reviewNotes,
    products,
  };
  const body = `${article.body.trim()}\n\n${buildAmazonButtonsHtml({ keyword, products, tag })}\n`;
  return matter.stringify(body, frontmatter);
}

// slug を安全な形にし、drafts/ と content/posts/ の既存ファイルと重ならない保存先を返す
export function resolveDraftPath(slug) {
  const base =
    String(slug)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '') || `draft-${Date.now()}`;
  let name = base;
  for (let i = 2; fs.existsSync(path.join(DRAFTS_DIR, `${name}.md`)) || fs.existsSync(path.join(POSTS_DIR, `${name}.md`)); i++) {
    name = `${base}-${i}`;
  }
  return path.join(DRAFTS_DIR, `${name}.md`);
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      category: { type: 'string' },
      tag: { type: 'string' },
    },
  });
  const keyword = positionals.join(' ').trim();
  const tag = values.tag ?? process.env.NEXT_PUBLIC_AMAZON_TAG ?? '';

  if (!keyword) {
    console.error('キーワードを指定してください。例: npm run draft -- "スマレジ 周辺機器 Amazon"');
    process.exit(1);
  }
  if (!tag) {
    console.error('Amazon のトラッキング ID がありません。.env.local の NEXT_PUBLIC_AMAZON_TAG か --tag で指定してください');
    process.exit(1);
  }
  if (values.category && !CATEGORY_SLUGS.includes(values.category)) {
    console.error(`--category は ${CATEGORY_SLUGS.join(' / ')} のどれかにしてください`);
    process.exit(1);
  }

  console.log(`「${keyword}」の記事を生成しています（数分かかることがあります）...`);
  let article;
  try {
    article = await generateArticle({ keyword, category: values.category });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error('API キーが無効です。.env.local の ANTHROPIC_API_KEY を確認してください');
    } else if (error instanceof Anthropic.RateLimitError) {
      console.error('API の利用上限に達しました。しばらく待ってから再実行してください');
    } else if (error instanceof Anthropic.APIError) {
      console.error(`API エラー（${error.status}）: ${error.message}`);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }

  const markdown = buildMarkdown({ article, keyword, tag, date: today() });
  fs.mkdirSync(DRAFTS_DIR, { recursive: true });
  const filePath = resolveDraftPath(article.slug);
  fs.writeFileSync(filePath, markdown, 'utf8');

  console.log(`\n保存しました: ${path.relative(process.cwd(), filePath)}`);
  console.log(`タイトル: ${article.title}`);
  if (article.reviewNotes.length > 0) {
    console.log('\n公開前に確認すること:');
    for (const note of article.reviewNotes) console.log(`- ${note}`);
  }
  console.log('\n確認が済んだら content/posts/ に移すと公開対象になります。');
}

// 直接実行されたときだけ main() を動かす（テストで関数を import できるように）
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
