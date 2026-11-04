// 楽天市場商品検索 API（2026-07-01 版）を使う、運営者の手元用のツール
//
//   npm run rakuten:search -- "感熱 ロール紙 80mm"            … 商品の候補を探す（広告リンクつき）
//   npm run rakuten:search -- "テーブル" --shop=low-ya        … お店を絞って探す
//   npm run rakuten:check                                    … 記事の楽天の商品リンクが、売り切れ・掲載終了になっていないか調べる
//
// - 環境変数（.env.local）：RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY / RAKUTEN_AFFILIATE_ID
// - 結果は .rakuten-cache/ に保存する。規約で、取得した情報を不特定多数と共有できる場所に置けないので Git に入れない
// - キーは画面にもファイルにも出さない
// - 公式の仕様：https://webservice.rakuten.co.jp/documentation/ichiba-item-search

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
try {
  process.loadEnvFile?.(path.join(ROOT, '.env.local'));
} catch {}

const API_URL = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701';
const SITE_URL = 'https://www.mise-register.com';
const OUT_DIR = path.join(ROOT, '.rakuten-cache');
const POST_DIRS = ['content/posts', 'scheduled'];
// 短い時間に同じ窓口へ続けて送ると応答が止まることがあるので、間をあける
const WAIT_MS = 1100;

const appId = (process.env.RAKUTEN_APP_ID ?? '').trim();
const accessKey = (process.env.RAKUTEN_ACCESS_KEY ?? '').trim();
const affiliateId = (process.env.RAKUTEN_AFFILIATE_ID ?? '').trim();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// API を呼ぶ。エラーのときも URL は出さない（キーが入っているため）
async function callApi(params) {
  const url = new URL(API_URL);
  url.searchParams.set('applicationId', appId);
  url.searchParams.set('accessKey', accessKey);
  if (affiliateId) url.searchParams.set('affiliateId', affiliateId);
  url.searchParams.set('format', 'json');
  url.searchParams.set('formatVersion', '2');
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  // 呼び出し元のサイトを送らないと 403 になる（楽天のアプリの登録で許可したサイトと合わせる）
  const res = await fetch(url, { headers: { Referer: `${SITE_URL}/`, Origin: SITE_URL } });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

function saveReport(name, text) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, name);
  fs.writeFileSync(file, text);
  return path.relative(ROOT, file);
}

// ---- 商品さがし ----
async function search(args) {
  const shop = args.find((a) => a.startsWith('--shop='))?.slice('--shop='.length);
  const keyword = args.filter((a) => !a.startsWith('--')).join(' ').trim();
  if (!keyword && !shop) {
    console.error('探す言葉を指定してください。例：npm run rakuten:search -- "感熱 ロール紙 80mm"');
    process.exitCode = 1;
    return;
  }
  const params = { hits: 10, imageFlag: 1, hasReviewFlag: 1, sort: '-reviewCount' };
  if (keyword) params.keyword = keyword;
  if (shop) params.shopCode = shop;
  const { status, body } = await callApi(params);
  if (status !== 200) {
    console.error(`API のエラー（${status}）：${body.errors?.errorMessage ?? body.error ?? ''} ${body.error_description ?? ''}`);
    process.exitCode = 1;
    return;
  }
  const items = body.Items ?? body.items ?? [];
  console.log(`「${keyword || shop}」の検索結果：全${body.count ?? 0}件のうちレビューの多い順に${items.length}件`);
  const lines = [`# 楽天の商品候補：${keyword || shop}`, '', `検索：${new Date().toLocaleString('ja-JP')}`, ''];
  items.forEach((item, index) => {
    const name = String(item.itemName ?? '').slice(0, 70);
    console.log(`${index + 1}. ${name}`);
    console.log(`   ${Number(item.itemPrice).toLocaleString('ja-JP')}円／レビュー${item.reviewCount}件・平均${item.reviewAverage}／料率${item.affiliateRate}%／${item.shopName}`);
    lines.push(`## ${index + 1}. ${item.itemName}`, '');
    lines.push(`- 価格：${item.itemPrice}円（検索した時点）`);
    lines.push(`- レビュー：${item.reviewCount}件・平均${item.reviewAverage}`);
    lines.push(`- 料率：${item.affiliateRate}%`);
    lines.push(`- お店：${item.shopName}`);
    lines.push(`- 商品コード：${item.itemCode}`);
    lines.push(`- 広告リンク：${item.affiliateUrl || item.itemUrl}`, '');
  });
  const stamp = new Date().toISOString().slice(0, 10);
  console.log(`\n保存先：${saveReport(`search-${stamp}.md`, lines.join('\n'))}`);
}

// ---- 記事の楽天リンクのチェック ----
// API の商品コードは「お店:数字の商品番号」。お店は広告リンクの pc= から、
// 商品番号は発行された画像の URL の item_id から取る（商品ページの URL の末尾は別の番号なので使えない）
function toItemCode(url, image) {
  try {
    const page = new URL(new URL(url).searchParams.get('pc'));
    if (page.hostname !== 'item.rakuten.co.jp') return null;
    const [shop] = page.pathname.split('/').filter(Boolean);
    const itemId = new URL(image).searchParams.get('item_id');
    return shop && itemId ? `${shop}:${itemId}` : null;
  } catch {
    return null;
  }
}

function collectLinks() {
  const links = new Map();
  let skipped = 0;
  for (const dir of POST_DIRS) {
    const full = path.join(ROOT, dir);
    if (!fs.existsSync(full)) continue;
    for (const file of fs.readdirSync(full).filter((f) => f.endsWith('.md'))) {
      const { data } = matter(fs.readFileSync(path.join(full, file), 'utf8'));
      for (const pick of data.picks ?? []) {
        if (!String(pick?.url ?? '').includes('rakuten.co.jp')) continue;
        const code = toItemCode(pick.url, pick.image);
        if (!code) {
          skipped += 1;
          continue;
        }
        if (!links.has(code)) links.set(code, { code, name: pick.name, posts: [] });
        links.get(code).posts.push(`${dir === 'scheduled' ? '予約 ' : ''}${file.replace(/\.md$/, '')}`);
      }
    }
  }
  return { links: [...links.values()], skipped };
}

async function check() {
  const { links, skipped } = collectLinks();
  console.log(`調べる商品：${links.length}件（商品ページ以外のリンク ${skipped}件は対象外）`);
  const problems = [];
  let okCount = 0;
  for (const [index, link] of links.entries()) {
    if (index > 0) await sleep(WAIT_MS);
    let result = await callApi({ itemCode: link.code, availability: 0, elements: 'itemCode,itemName,itemPrice,availability' });
    if (result.status === 429) {
      await sleep(WAIT_MS * 5);
      result = await callApi({ itemCode: link.code, availability: 0, elements: 'itemCode,itemName,itemPrice,availability' });
    }
    const { status, body } = result;
    const items = body.Items ?? body.items ?? [];
    let state = null;
    if (status === 404 || (status === 200 && items.length === 0)) state = '見つからない（掲載終了の可能性）';
    else if (status !== 200) state = `確認できない（API のエラー ${status}）`;
    else if (Number(items[0].availability) === 0) state = '売り切れ';
    if (state) {
      problems.push({ ...link, state });
      console.log(`× ${state}：${link.name}`);
    } else {
      okCount += 1;
    }
  }
  console.log(`\n結果：問題なし ${okCount}件／要確認 ${problems.length}件`);
  const lines = [`# 楽天リンクのチェック`, '', `確認：${new Date().toLocaleString('ja-JP')}`, '', `問題なし ${okCount}件／要確認 ${problems.length}件／対象外 ${skipped}件`, ''];
  for (const p of problems) {
    lines.push(`## ${p.state}：${p.name}`, '', `- 商品コード：${p.code}`, `- 記事：${p.posts.join('、')}`, '');
    console.log(`  ${p.state}｜${p.code}｜${p.posts.join('、')}`);
  }
  const stamp = new Date().toISOString().slice(0, 10);
  console.log(`\n保存先：${saveReport(`check-${stamp}.md`, lines.join('\n'))}`);
}

const [command, ...rest] = process.argv.slice(2);
if (!appId || !accessKey) {
  console.error('.env.local に RAKUTEN_APP_ID と RAKUTEN_ACCESS_KEY を入れてください。');
  process.exitCode = 1;
} else if (command === 'search') {
  await search(rest);
} else if (command === 'check') {
  await check();
} else {
  console.error('使い方：node scripts/rakuten.mjs search "探す言葉" または node scripts/rakuten.mjs check');
  process.exitCode = 1;
}
