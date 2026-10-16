import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

// 本文中のこの位置に「比較表 + 商品カード」を差し込む（なければ本文の末尾）
const PRODUCTS_MARKER = '<!-- products -->';

// content/posts/ 内の .md ファイル名（拡張子なし）を slug として返す
export function getPostSlugs() {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''));
}

// YAML の日付は Date 型になるため YYYY-MM-DD 文字列にそろえる
function formatDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? '');
}

const toStringList = (value) => (Array.isArray(value) ? value.map(String) : []);

// フロントマターの products を正規化する
function normalizeProducts(products) {
  if (!Array.isArray(products)) return [];
  return products.map((p) => ({
    name: String(p.name),
    asin: p.asin ? String(p.asin) : '',
    // ASIN がないときは Amazon 検索のキーワードにする
    keyword: String(p.keyword ?? p.name),
    badge: p.badge ? String(p.badge) : '',
    summary: p.summary ? String(p.summary) : '',
    specs: p.specs && typeof p.specs === 'object' ? p.specs : {},
    pros: toStringList(p.pros),
    cons: toStringList(p.cons),
  }));
}

// フロントマター（title, date, tags ほか）を正規化する
function normalizeFrontmatter(slug, data) {
  return {
    slug,
    title: data.title ?? slug,
    date: formatDate(data.date),
    updated: data.updated ? formatDate(data.updated) : '',
    tags: toStringList(data.tags),
    description: data.description ? String(data.description) : '',
    category: data.category ? String(data.category) : '',
    // サムネイル画像（public/ からのパス。例: /images/cafe.jpg）。なければ文字のサムネイルを表示
    image: data.image ? String(data.image) : '',
    // カテゴリー内の表示順（小さいほど先）。なければ末尾
    order: Number.isFinite(data.order) ? data.order : Infinity,
  };
}

function readPost(slug) {
  const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.md`), 'utf8');
  return matter(raw);
}

// 記事中の HTML（Amazon ボタンなど）を残すため sanitize を切る。記事は自分で書いたものだけを扱う前提
async function markdownToHtml(markdown) {
  const processed = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(markdown);
  return processed.toString();
}

// 記事一覧（本文なし）を日付の新しい順で返す
export function getAllPosts() {
  return getPostSlugs()
    .map((slug) => normalizeFrontmatter(slug, readPost(slug).data))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// カテゴリー内の記事を order 順（同じなら新しい順）で返す
export function getPostsByCategory(category) {
  return getAllPosts()
    .filter((post) => post.category === category)
    .sort((a, b) => a.order - b.order);
}

// 1 記事分のフロントマター・商品データと、HTML 化した本文（商品の前後）を返す
export async function getPostBySlug(slug) {
  const { data, content } = readPost(slug);
  const [before, after = ''] = content.split(PRODUCTS_MARKER);
  return {
    ...normalizeFrontmatter(slug, data),
    products: normalizeProducts(data.products),
    beforeHtml: await markdownToHtml(before),
    afterHtml: await markdownToHtml(after),
  };
}
