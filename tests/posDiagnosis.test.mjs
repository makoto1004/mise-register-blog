import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  DIAGNOSIS_QUESTIONS,
  DIAGNOSIS_RULES,
  diagnosePos,
} from '../lib/posDiagnosis.js'
import { JOURNEY_STEPS } from '../lib/journey.js'

// プロジェクトのルート（テストを実行する場所に左右されないようにする）
const ROOT = fileURLToPath(new URL('../', import.meta.url))
const GROUPS = ['choose', 'devices', 'setup']
const journeySlugs = JOURNEY_STEPS.flatMap((s) => s.slugs)
// 対応表（DIAGNOSIS_RULES）の中の slug をすべて集める
const ruleSlugs = Object.values(DIAGNOSIS_RULES).flatMap((byValue) =>
  Object.values(byValue).flatMap((group) => Object.values(group).flat()),
)
const everySlug = new Set([...journeySlugs, ...ruleSlugs])

function allCombos() {
  const [shop, flow, budget] = DIAGNOSIS_QUESTIONS.map((q) => q.options.map((o) => o.value))
  const out = []
  for (const s of shop) for (const f of flow) for (const b of budget) out.push({ shop: s, flow: f, budget: b })
  return out
}

test('returns null when an answer is missing', () => {
  assert.equal(diagnosePos({ shop: 'food', flow: 'prepay' }, everySlug), null)
})

test('returns at most two slugs per group', () => {
  const combos = allCombos()
  assert.equal(combos.length, 36)
  for (const a of combos) {
    const r = diagnosePos(a, everySlug)
    for (const g of GROUPS) assert.ok(r[g].length <= 2)
  }
})

test('filters unpublished slugs', () => {
  const a = { shop: 'food', flow: 'prepay', budget: 'full' }
  const target = diagnosePos(a, everySlug).devices[0]
  const rest = new Set(everySlug)
  rest.delete(target)
  const r = diagnosePos(a, rest)
  for (const g of GROUPS) {
    assert.ok(!r[g].includes(target))
    assert.ok(r[g].length > 0)
  }
})

test('keeps shop, flow, budget order and removes duplicates', () => {
  const a = { shop: 'food', flow: 'prepay', budget: 'full' }
  // 飲食→先払い→本格 の順に連結し、重複（receipt-printer-comparison など）を除いた先頭2本
  assert.deepEqual(diagnosePos(a, everySlug).devices, ['pos-peripherals-guide', 'receipt-printer-comparison'])
  // 先頭2本が未公開なら、次の2本（連結順どおり）が繰り上がる
  const rest = new Set(everySlug)
  rest.delete('pos-peripherals-guide')
  rest.delete('receipt-printer-comparison')
  assert.deepEqual(diagnosePos(a, rest).devices, ['cash-drawer-comparison', 'scanner-phone-screen-code'])
})

test('fills only the empty group from the matching journey step', () => {
  const a = { shop: 'food', flow: 'prepay', budget: 'full' }
  const before = diagnosePos(a, everySlug)
  const rest = new Set(everySlug)
  for (const byValue of [DIAGNOSIS_RULES.shop.food, DIAGNOSIS_RULES.flow.prepay, DIAGNOSIS_RULES.budget.full]) {
    for (const s of byValue.devices) rest.delete(s)
  }
  const r = diagnosePos(a, rest)
  const step = JOURNEY_STEPS.find((s) => s.id === 'devices')
  assert.equal(r.fallbackToConsult, false)
  assert.ok(r.devices.length > 0)
  for (const s of r.devices) assert.ok(step.slugs.includes(s))
  assert.deepEqual(r.choose, before.choose)
  assert.deepEqual(r.setup, before.setup)
})

test('falls back when a group is empty', () => {
  const onlyJourney = new Set(journeySlugs)
  for (const a of allCombos()) {
    const r = diagnosePos(a, onlyJourney)
    for (const g of GROUPS) assert.ok(r[g].length > 0)
  }
  const empty = diagnosePos({ shop: 'food', flow: 'prepay', budget: 'free' }, new Set())
  assert.equal(empty.fallbackToConsult, true)
})

test('every rule slug exists', () => {
  for (const slug of everySlug) {
    // scheduled/ は git に入れない予約記事の置き場（運営者のパソコンにだけある）も見る
    const ok = fs.existsSync(`${ROOT}content/posts/${slug}.md`) || fs.existsSync(`${ROOT}scheduled/${slug}.md`)
    assert.ok(ok, `${slug} が content/posts にも scheduled にもありません`)
  }
})

test('journey steps are fixed', () => {
  assert.equal(JOURNEY_STEPS.length, 4)
  assert.deepEqual(JOURNEY_STEPS.map((s) => s.number), [1, 2, 3, 4])
  assert.deepEqual(JOURNEY_STEPS.map((s) => s.path), ['/find', '/devices-guide', '/setup-guide', '/after-opening'])
  for (const s of JOURNEY_STEPS) assert.ok(s.slugs.length >= 4 && s.slugs.length <= 12)
})
