import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { resolveServices } from './affiliates.js';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

// 本文中の目印の位置に、ブロックを差し込む（目印がなければ本文の末尾）
//   <!-- products --> … 比較表 + 商品カード（Amazon）
//   <!-- services --> … サービス紹介のカード（A8.net など）
//   <!-- picks -->    … 実際の商品の例（楽天アフィリエイトなどの画像付きリンク）
//   <!-- videos -->   … 参考になる YouTube 動画
const MARKER_PATTERN = /<!--\s*(products|services|picks|videos)\s*-->/;
const BLOCK_TYPES = ['products', 'services', 'picks', 'videos'];

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
    // 商品画像（SiteStripe の「画像」の img の src、または public/ に置いた自分の写真）と計測用画像
    image: p.image ? String(p.image) : '',
    imagePixel: p.imagePixel ? String(p.imagePixel) : '',
    specs: p.specs && typeof p.specs === 'object' ? p.specs : {},
    pros: toStringList(p.pros),
    cons: toStringList(p.cons),
  }));
}

// フロントマターの picks（実際の商品の例）を正規化する
// url・image は楽天アフィリエイトなどで発行されたものをそのまま使う
function normalizePicks(picks) {
  if (!Array.isArray(picks)) return [];
  return picks
    .filter((p) => p && p.name && p.url)
    .map((p) => ({
      name: String(p.name),
      url: String(p.url),
      image: p.image ? String(p.image) : '',
      shop: p.shop ? String(p.shop) : '楽天市場',
      note: p.note ? String(p.note) : '',
    }));
}

// フロントマターの videos（参考になる YouTube 動画）を正規化する。id は YouTube の動画 ID（watch?v= の後ろ）
function normalizeVideos(videos) {
  if (!Array.isArray(videos)) return [];
  return videos
    .filter((v) => v && /^[A-Za-z0-9_-]{11}$/.test(String(v.id ?? '')))
    .map((v) => ({
      id: String(v.id),
      title: v.title ? String(v.title) : '',
      channel: v.channel ? String(v.channel) : '',
      note: v.note ? String(v.note) : '',
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

// 本文を目印で区切り、[{ type: 'html', html }, { type: 'products' }, …] の並びにする
async function splitIntoSections(content, has) {
  const parts = content.split(MARKER_PATTERN);
  const sections = [];
  const placed = new Set();
  // split の結果は「本文, 目印の名前, 本文, 目印の名前, …」の順
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i].trim()) sections.push({ type: 'html', html: await markdownToHtml(parts[i]) });
    } else if (!placed.has(parts[i])) {
      sections.push({ type: parts[i] });
      placed.add(parts[i]);
    }
  }
  // 目印を書いていない記事は、本文の末尾に差し込む
  for (const type of BLOCK_TYPES) {
    if (has[type] && !placed.has(type)) sections.push({ type });
  }
  return sections.filter((s) => s.type === 'html' || has[s.type]);
}

// 1 記事分のフロントマター・商品・サービスのデータと、区切った本文を返す
export async function getPostBySlug(slug) {
  const { data, content } = readPost(slug);
  const products = normalizeProducts(data.products);
  const services = resolveServices(data.services);
  const picks = normalizePicks(data.picks);
  const videos = normalizeVideos(data.videos);
  return {
    ...normalizeFrontmatter(slug, data),
    products,
    services,
    picks,
    videos,
    sections: await splitIntoSections(content, {
      products: products.length > 0,
      services: services.length > 0,
      picks: picks.length > 0,
      videos: videos.length > 0,
    }),
  };
}
