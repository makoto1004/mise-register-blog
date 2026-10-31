// Amazon の商品情報（商品名・画像の URL・価格）を Creators API から取り、.amazon-cache/items.json に保存する
// npm run build の前に自動で動く（package.json の prebuild）。Vercel でも同じ
//
// - 記事のフロントマター products の asin だけを対象にする（keyword だけの商品は今までどおり検索リンク）
// - 環境変数（Vercel の設定・.env.local）：
//     AMAZON_CREATORS_CREDENTIAL_ID / AMAZON_CREATORS_CREDENTIAL_SECRET … アソシエイト・セントラルの「Creators API」で作ったもの
//     AMAZON_CREATORS_VERSION … 同じ画面に出る Version（日本は 3.3。なければ 3.3 とみなす）
//     NEXT_PUBLIC_AMAZON_TAG … アソシエイトのトラッキング ID（今までのリンクと同じもの）
// - キーがないとき・API がエラーのときは空のデータを書いて終わる（ビルドは止めない。カードは今までどおりの表示になる）
// - 規約（Amazon.co.jp の PA-API ライセンス契約）で、価格などは最長 24 時間、画像は URL だけを 24 時間まで保存できる。
//   そのため、このファイルは Git に入れず、ビルドのたびに取り直す。サイトは 1 日 2 回作り直す（.github/workflows/rebuild-amazon.yml）

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
// パソコンで動かすときは .env.local を読む（Vercel では設定画面の環境変数がそのまま入っている）
try {
  process.loadEnvFile?.(path.join(ROOT, '.env.local'));
} catch {}
const POSTS_DIR = path.join(ROOT, 'content', 'posts');
const OUT_FILE = path.join(ROOT, '.amazon-cache', 'items.json');
const MARKETPLACE = 'www.amazon.co.jp';
const API_URL = 'https://creatorsapi.amazon/catalog/v1/getItems';
// 認証の窓口は Version で決まる（Creators API のドキュメント「Using cURL」の Regional Endpoints）
const TOKEN_URLS = { '3.1': 'https://api.amazon.com/auth/o2/token', '3.2': 'https://api.amazon.co.uk/auth/o2/token', '3.3': 'https://api.amazon.co.jp/auth/o2/token' };
const RESOURCES = ['itemInfo.title', 'images.primary.medium', 'offersV2.listings.price', 'offersV2.listings.isBuyBoxWinner', 'offersV2.listings.availability'];

const id = (process.env.AMAZON_CREATORS_CREDENTIAL_ID ?? '').trim();
const secret = (process.env.AMAZON_CREATORS_CREDENTIAL_SECRET ?? '').trim();
const version = (process.env.AMAZON_CREATORS_VERSION ?? '3.3').trim();
const tag = (process.env.NEXT_PUBLIC_AMAZON_TAG ?? '').trim();

function save(items, note) {
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify({ fetchedAt: Object.keys(items).length ? new Date().toISOString() : null, items }, null, 2));
  console.log(`[amazon] ${note}`);
}

// 記事の products から ASIN を集める
function collectAsins() {
  const asins = new Set();
  for (const file of fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'))) {
    const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'));
    for (const p of data.products ?? []) if (/^[A-Z0-9]{10}$/.test(String(p.asin ?? ''))) asins.add(p.asin);
  }
  return [...asins];
}

async function getToken() {
  const url = TOKEN_URLS[version];
  if (!url) throw new Error(`AMAZON_CREATORS_VERSION「${version}」に対応する認証の窓口がありません`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: id, client_secret: secret, scope: 'creatorsapi::default' }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) throw new Error(`認証に失敗しました（${res.status}）`);
  return body.access_token;
}

// API の返す 1 商品を、カードに使う形にする
function toItem(raw) {
  const listings = raw.offersV2?.listings ?? [];
  const offer = listings.find((l) => l.isBuyBoxWinner) ?? listings[0];
  const money = offer?.price?.money;
  const image = raw.images?.primary?.medium;
  return {
    title: raw.itemInfo?.title?.displayValue ?? '',
    url: raw.detailPageURL ?? '',
    image: image?.url ? { url: image.url, width: image.width, height: image.height } : null,
    price: Number.isFinite(money?.amount) ? `￥${Math.round(money.amount).toLocaleString('ja-JP')}` : null,
  };
}

async function main() {
  if (!id || !secret || !tag) return save({}, 'Creators API のキーかトラッキング ID がないため、商品情報は取りません（今までどおりの表示）');
  const asins = collectAsins();
  if (asins.length === 0) return save({}, '記事に ASIN のある商品がありません');

  const token = await getToken();
  const items = {};
  for (let i = 0; i < asins.length; i += 10) { // 1 回に 10 件まで
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'x-marketplace': MARKETPLACE },
      body: JSON.stringify({ itemIds: asins.slice(i, i + 10), itemIdType: 'ASIN', marketplace: MARKETPLACE, partnerTag: tag, resources: RESOURCES }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`商品情報の取得に失敗しました（${res.status} ${body.errors?.[0]?.code ?? ''}）`);
    // ドキュメントの例で itemResults と itemsResult の両方の書き方があるため、どちらも読む
    for (const raw of (body.itemResults ?? body.itemsResult)?.items ?? []) items[raw.asin] = toItem(raw);
    for (const e of body.errors ?? []) console.log(`[amazon] 取れなかった商品: ${e.message ?? e.code}`);
    if (i + 10 < asins.length) await new Promise((r) => setTimeout(r, 1100)); // 呼び出しの間隔をあける
  }
  save(items, `${Object.keys(items).length} / ${asins.length} 件の商品情報を取りました`);
}

main().catch((err) => save({}, `商品情報を取れなかったため、今までどおりの表示にします: ${err.message}`));
