import { JOURNEY_STEPS } from './journey.js'

// 診断の質問と選択肢（value は DIAGNOSIS_RULES のキーと同じ）
export const DIAGNOSIS_QUESTIONS = [
  {
    id: 'shop',
    label: 'お店の種類',
    options: [
      { value: 'food', label: '飲食' },
      { value: 'retail', label: '物販' },
      { value: 'beauty', label: '美容・サービス' },
      { value: 'mobile', label: 'キッチンカー' },
    ],
  },
  {
    id: 'flow',
    label: '会計の流れ',
    options: [
      { value: 'prepay', label: '先に払う' },
      { value: 'postpay', label: 'あとで払う（席で会計）' },
      { value: 'reserve', label: '予約して来店' },
    ],
  },
  {
    id: 'budget',
    label: '予算',
    options: [
      { value: 'free', label: '無料のアプリで始める' },
      { value: 'full', label: '周辺機器もそろえる' },
      { value: 'unknown', label: 'まだわからない' },
    ],
  },
]

// ── 対応表（運営者が見て直せる場所） ──────────────────────────
// 「質問の id → 答えの value → 案内するグループ」の順に slug を並べている。
//   choose  = POS レジの選び方の記事
//   devices = そろえる周辺機器の記事
//   setup   = つなぎ方・設定の注意の記事
// 診断では、お店の種類 → 会計の流れ → 予算 の順に3つの答えの slug をつなぎ、
// 重複を除き、公開済みのものだけを先頭から2本ずつ案内する。
// つまり先に書いた slug ほど優先される。記事を直すときは slug を書きかえるだけでよい。
// slug は content/posts/<slug>.md（公開済み）か scheduled/<slug>.md（予約中）にあるもの。
// 予約中の slug は公開されるまで自動で除かれる。足りないグループは道のり（lib/journey.js）の記事で補う。
export const DIAGNOSIS_RULES = {
  shop: {
    food: {
      choose: ['cafe-pos-comparison', 'cafe-mobile-order'],
      devices: ['pos-peripherals-guide', 'receipt-printer-comparison'],
      setup: ['pos-initial-setup-guide', 'store-network-setup'],
    },
    retail: {
      choose: ['apparel-pos-comparison', 'pos-benefits-by-industry'],
      devices: ['barcode-scanner-comparison', 'hand-scanner-inventory'],
      setup: ['smaregi-product-group-code', 'airregi-product-registration'],
    },
    beauty: {
      choose: ['salon-pos-comparison', 'salon-reservation-crm'],
      devices: ['salon-ipad-peripherals', 'pos-tablet-stand-comparison'],
      setup: ['pos-initial-setup-guide', 'store-wifi-router'],
    },
    mobile: {
      choose: ['kitchen-car-pos-comparison', 'kitchen-car-cashless'],
      devices: ['kitchen-car-event-equipment', 'receipt-printer-comparison'],
      setup: ['kitchen-car-offline-payment', 'pos-initial-setup-guide'],
    },
  },
  flow: {
    prepay: {
      choose: ['pos-benefits-by-industry'],
      devices: ['cash-drawer-comparison', 'receipt-printer-comparison'],
      setup: ['airregi-printer-drawer-setup'],
    },
    postpay: {
      choose: ['cafe-mobile-order', 'izakaya-pos'],
      devices: ['ipad-customer-display', 'pos-tablet-stand-comparison'],
      setup: ['store-network-setup', 'store-wifi-router'],
    },
    reserve: {
      choose: ['salon-reservation-crm', 'salon-pos-comparison'],
      devices: ['ipad-customer-display', 'cash-drawer-comparison'],
      setup: ['store-guest-wifi', 'airregi-daily-workflow'],
    },
  },
  budget: {
    free: {
      choose: ['pos-low-cost-start'],
      devices: ['pos-tablet-stand-comparison', 'pos-peripherals-guide'],
      setup: ['airregi-product-registration', 'pos-initial-setup-guide'],
    },
    full: {
      choose: ['pos-benefits-by-industry'],
      devices: ['pos-peripherals-guide', 'scanner-phone-screen-code'],
      setup: ['store-network-setup', 'airregi-printer-drawer-setup'],
    },
    unknown: {
      choose: ['pos-low-cost-start', 'pos-benefits-by-industry'],
      devices: ['pos-peripherals-guide'],
      setup: ['pos-initial-setup-guide'],
    },
  },
}

const GROUP_TO_STEP = { choose: 'find', devices: 'devices', setup: 'setup' }
const MAX_PER_GROUP = 2

function unique(list) {
  return [...new Set(list)]
}

// 3つの答えから案内する記事を決める。どれか未選択なら null。
export function diagnosePos(answers, publishedSlugs) {
  const { shop, flow, budget } = answers || {}
  if (!shop || !flow || !budget) return null
  const picked = [
    DIAGNOSIS_RULES.shop[shop],
    DIAGNOSIS_RULES.flow[flow],
    DIAGNOSIS_RULES.budget[budget],
  ]
  if (picked.some((p) => !p)) return null

  const result = {}
  for (const group of Object.keys(GROUP_TO_STEP)) {
    let slugs = unique(picked.flatMap((p) => p[group] || [])).filter((s) => publishedSlugs.has(s))
    if (slugs.length === 0) {
      const step = JOURNEY_STEPS.find((s) => s.id === GROUP_TO_STEP[group])
      slugs = step.slugs.filter((s) => publishedSlugs.has(s))
    }
    result[group] = slugs.slice(0, MAX_PER_GROUP)
  }
  result.fallbackToConsult = Object.keys(GROUP_TO_STEP).every((g) => result[g].length === 0)
  return result
}
