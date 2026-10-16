// 本番の URL を決める。優先順: NEXT_PUBLIC_SITE_URL → Vercel の本番 URL（自動で入る）→ 仮の URL
// 空文字や「https://」なしの値でもビルドが止まらないようにする
function resolveSiteUrl() {
  const candidates = [process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL];
  for (const value of candidates) {
    const trimmed = (value ?? '').trim();
    if (!trimmed) continue;
    const withProtocol = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      return new URL(withProtocol).toString().replace(/\/$/, '');
    } catch {
      // URL として読めない値は飛ばして次の候補へ
    }
  }
  return 'https://example.com';
}

// サイト全体の設定
export const SITE = {
  name: 'mise & register',
  // ヘッダー・フッターに出すキャッチコピー
  catchphrase: '小さなお店のレジ選びを、すっきり、納得。業種別のPOSレジ・周辺機器ガイド',
  description:
    'カフェ・美容院・キッチンカーなど業種別に、POSレジと周辺機器の選び方を比較・解説するブログ',
  // 本番の URL（サイトマップ・OGP に使う）
  url: resolveSiteUrl(),
  // Amazon アソシエイトのトラッキング ID（例: yourname-22）
  amazonTag: (process.env.NEXT_PUBLIC_AMAZON_TAG ?? '').trim(),
};

// カテゴリー（URL に使う slug → 表示名）。記事のフロントマター category に slug を書く
// 並び順がそのままトップページ・ナビの表示順になる
export const CATEGORIES = {
  cafe: 'カフェ・飲食店向け',
  salon: '美容院・サロン向け',
  'kitchen-car': 'キッチンカー・移動販売向け',
  apparel: 'アパレル・雑貨店向け',
  devices: '周辺機器の選び方（共通）',
};

// サムネイルに出す英字ラベル（色は globals.css の .thumb-<slug> で指定）
export const CATEGORY_LABELS = {
  cafe: 'CAFE',
  salon: 'SALON',
  'kitchen-car': 'KITCHEN CAR',
  apparel: 'APPAREL',
  devices: 'DEVICES',
};

// カテゴリーの説明文（トップページとカテゴリー一覧に表示）
export const CATEGORY_DESCRIPTIONS = {
  cafe: 'カフェ・飲食店に合うPOSレジの比較、開業時にそろえる機材・業務用家具、モバイルオーダー連携を解説します。',
  salon: '美容院・サロン向けのPOSレジ比較、予約システム・顧客管理の連携、カルテ用iPadや待合スペースの家具の選び方を解説します。',
  'kitchen-car': 'キッチンカー・移動販売向けのPOSレジ比較、電波が弱い場所での決済対策、屋外イベント用の機材を解説します。',
  apparel: 'アパレル・雑貨店向けのPOSレジ比較と、ディスプレイラックなど売り場づくりの備品の選び方を解説します。',
  devices: 'レシートプリンター・キャッシュドロア・バーコードリーダーなど、業種を問わず使う周辺機器の選び方です。',
};

// Amazon の商品リンクを作る。ASIN があれば商品ページ、なければ検索結果ページへ
export function buildAmazonUrl({ asin, keyword }) {
  const url = asin
    ? new URL(`https://www.amazon.co.jp/dp/${asin}/`)
    : new URL('https://www.amazon.co.jp/s');
  if (!asin) url.searchParams.set('k', keyword);
  if (SITE.amazonTag) url.searchParams.set('tag', SITE.amazonTag);
  return url.toString();
}
