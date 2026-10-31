import fs from 'node:fs';
import path from 'node:path';

// scripts/fetch-amazon-items.mjs がビルドの前に作った商品情報を読む（ないときは空）
const FILE = path.join(process.cwd(), '.amazon-cache', 'items.json');
let cache;

function load() {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    cache = { fetchedAt: null, items: {} };
  }
  return cache;
}

// ASIN の商品情報（商品名・画像・価格・リンク）と、取った日時を返す。なければ null
export function getAmazonItem(asin) {
  const { fetchedAt, items } = load();
  const item = asin && items?.[asin];
  return item && fetchedAt ? { ...item, fetchedAt } : null;
}
