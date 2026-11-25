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
      { value: 'mobile', label: 'キッチンカー・イベント' },
    ],
  },
  {
    id: 'flow',
    label: '会計の流れ',
    options: [
      { value: 'prepay', label: 'その場で払う（レジ・先払い・券売機）' },
      { value: 'postpay', label: 'あとで払う（テーブルごとに会計）' },
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
// 診断では、3つの答えから1本ずつ順番に取る（どの答えも結果に効くようにする。2026-11-25 に変更）。
// 重複・公開前・お店の種類に合わない記事（SHOP_ONLY）は除き、足りなければ2周目に入る。
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
      setup: ['pos-initial-setup-guide', 'store-network-setup'],
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
      setup: ['store-network-setup'],
    },
    postpay: {
      choose: ['cafe-mobile-order', 'izakaya-pos'],
      devices: ['ipad-customer-display', 'pos-tablet-stand-comparison'],
      setup: ['store-network-setup', 'store-wifi-router'],
    },
    reserve: {
      choose: ['salon-reservation-crm', 'salon-pos-comparison'],
      devices: ['ipad-customer-display', 'cash-drawer-comparison'],
      setup: ['store-guest-wifi', 'store-wifi-router'],
    },
  },
  budget: {
    free: {
      choose: ['pos-low-cost-start'],
      devices: ['pos-tablet-stand-comparison', 'pos-peripherals-guide'],
      setup: ['pos-initial-setup-guide', 'store-wifi-router'],
    },
    full: {
      choose: ['pos-subsidy-2026', 'pos-benefits-by-industry'],
      devices: ['cash-drawer-comparison', 'pos-peripherals-guide', 'scanner-phone-screen-code'],
      setup: ['store-network-setup', 'pos-initial-setup-guide'],
    },
    unknown: {
      choose: ['pos-benefits-by-industry', 'pos-low-cost-start'],
      devices: ['pos-peripherals-guide', 'receipt-printer-comparison'],
      setup: ['pos-initial-setup-guide'],
    },
  },
}

// お店の種類が合うときだけ案内する記事
const SHOP_ONLY = {
  'cafe-mobile-order': ['food'],
  'izakaya-pos': ['food'],
  'salon-reservation-crm': ['beauty'],
  'salon-pos-comparison': ['beauty'],
}

// まず比べたい POS レジの候補（2つずつ）。理由は、公開中の比較記事に書いてあることだけにする
// （cafe / apparel / salon / kitchen-car の比較記事、izakaya-pos、salon-reservation-crm）。広告の報酬では並べない。
// 上から順に見て、最初に当てはまったものを使う（shop 以外は省くと「どれでも」）。
const AIR = { name: 'Airレジ', reason: '基本機能を無料で始めやすい' }
const SQUARE = { name: 'Square', reason: '決済とレジが一体で、カード払いを早く始めやすい' }
const SMAREGI = { name: 'スマレジ', reason: '有料プランで在庫・分析の機能を広げられる' }
export const CANDIDATE_RULES = [
  {
    shop: 'food', flow: ['postpay', 'reserve'], budget: ['free'],
    picks: [
      { name: 'Square', reason: '無料のフリープランから始められ、テーブルの管理もできる' },
      { name: 'Airレジ オーダー', reason: 'テーブルの注文に対応。月額13,200円から' },
    ],
  },
  {
    shop: 'food', flow: ['postpay', 'reserve'],
    picks: [
      { name: 'Airレジ オーダー', reason: 'テーブルの注文に対応。月額13,200円から' },
      { name: 'スマレジ（フードビジネス）', reason: 'ハンディで注文を取れる。月額15,400円' },
    ],
  },
  { shop: 'food', budget: ['full'], picks: [AIR, SMAREGI] },
  { shop: 'food', picks: [AIR, SQUARE] },
  {
    shop: 'retail', budget: ['full'],
    picks: [
      { name: 'スマレジ', reason: '在庫管理と分析の機能が充実。商品数が多いお店向き' },
      { name: 'Square', reason: 'ネットショップの機能も用意されている' },
    ],
  },
  {
    shop: 'retail', budget: ['free'],
    picks: [
      { name: 'Airレジ', reason: '基本機能を無料で始めやすい。商品数が少ないお店向き' },
      { name: 'Square', reason: 'ネットショップの機能も用意されている' },
    ],
  },
  { shop: 'retail', picks: [AIR, SMAREGI] },
  {
    shop: 'beauty', flow: ['reserve'], budget: ['full'],
    picks: [
      { name: 'Square', reason: 'オンラインの予約（Square 予約）と組み合わせられる' },
      { name: 'サロン専用のシステム', reason: '予約・カルテ・スタッフ管理まで一体のものが多い' },
    ],
  },
  {
    shop: 'beauty', flow: ['reserve'],
    picks: [{ name: 'Square', reason: 'オンラインの予約（Square 予約）と組み合わせられる' }, AIR],
  },
  { shop: 'beauty', budget: ['full'], picks: [AIR, SMAREGI] },
  { shop: 'beauty', picks: [AIR, SQUARE] },
  {
    shop: 'mobile',
    picks: [
      { name: 'Square', reason: '決済とレジが一体。小型の端末で持ち運びやすい' },
      { name: 'Airレジ＋Airペイ', reason: 'お店でも同じ POS レジを使いたい人向き' },
    ],
  },
]

const GROUP_TO_STEP = { choose: 'find', devices: 'devices', setup: 'setup' }
const MAX_PER_GROUP = { choose: 3, devices: 2, setup: 2 }
// 本数が3本より少ないまとまりで、どの答えを先に見るか
const ANSWER_ORDER = { choose: ['shop', 'flow', 'budget'], devices: ['shop', 'budget', 'flow'], setup: ['shop', 'flow', 'budget'] }

export function pickCandidates({ shop, flow, budget }) {
  const rule = CANDIDATE_RULES.find(
    (r) => r.shop === shop && (!r.flow || r.flow.includes(flow)) && (!r.budget || r.budget.includes(budget)),
  )
  return rule ? rule.picks : []
}

// 3つの答えの slug の並びから、1本ずつ順番に max 本まで取る
function roundRobin(lists, max, ok) {
  const queues = lists.map((list) => list.filter(ok))
  const out = []
  while (out.length < max && queues.some((q) => q.length > 0)) {
    for (const q of queues) {
      while (q.length > 0 && out.includes(q[0])) q.shift()
      if (q.length > 0 && out.length < max) out.push(q.shift())
    }
  }
  return out
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

  const byAnswer = { shop: picked[0], flow: picked[1], budget: picked[2] }
  const ok = (s) => publishedSlugs.has(s) && (!SHOP_ONLY[s] || SHOP_ONLY[s].includes(shop))
  const result = { candidates: pickCandidates(answers) }
  for (const group of Object.keys(GROUP_TO_STEP)) {
    let slugs = roundRobin(ANSWER_ORDER[group].map((k) => byAnswer[k][group] || []), MAX_PER_GROUP[group], ok)
    if (slugs.length === 0) {
      const step = JOURNEY_STEPS.find((s) => s.id === GROUP_TO_STEP[group])
      slugs = step.slugs.filter(ok)
    }
    result[group] = slugs.slice(0, MAX_PER_GROUP[group])
  }
  result.fallbackToConsult = Object.keys(GROUP_TO_STEP).every((g) => result[g].length === 0)
  return result
}
