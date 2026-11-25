import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import {
  DIAGNOSIS_QUESTIONS,
  DIAGNOSIS_RULES,
  diagnosePos,
} from '../lib/posDiagnosis.js'
import { JOURNEY_STEPS } from '../lib/journey.js'

// プロジェクトのルート（テストを実行する場所に左右されないようにする）
const ROOT = fileURLToPath(new URL('../', import.meta.url))
const GROUPS = ['choose', 'devices', 'setup']

// scheduled/ は git に入れない予約記事の置き場で、運営者のパソコンの本体のフォルダー（markdown-blog）にだけある。
// worktree（markdown-blog-redraw など）でテストするときは、本体のフォルダーの scheduled/ も見る
function mainRepoRoot() {
  try {
    const common = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: ROOT, encoding: 'utf8' }).trim()
    return common.replace(/[\\/]\.git[\\/]?$/, '/')
  } catch {
    return ROOT
  }
}
const SCHEDULED_DIRS = [...new Set([`${ROOT}scheduled`, `${mainRepoRoot()}scheduled`])]

function postExists(slug) {
  return fs.existsSync(`${ROOT}content/posts/${slug}.md`) || SCHEDULED_DIRS.some((dir) => fs.existsSync(`${dir}/${slug}.md`))
}
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

test('limits the number of slugs per group', () => {
  const combos = allCombos()
  assert.equal(combos.length, 36)
  for (const a of combos) {
    const r = diagnosePos(a, everySlug)
    for (const g of GROUPS) assert.ok(r[g].length <= { choose: 3, devices: 2, setup: 2 }[g])
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

test('takes one slug from each answer in turn', () => {
  const a = { shop: 'food', flow: 'prepay', budget: 'full' }
  // 選び方は、お店の種類・会計・予算から1本ずつ
  assert.deepEqual(diagnosePos(a, everySlug).choose, ['cafe-pos-comparison', 'pos-benefits-by-industry', 'pos-subsidy-2026'])
  // 周辺機器は2本なので、お店の種類と予算を先に見る
  assert.deepEqual(diagnosePos(a, everySlug).devices, ['pos-peripherals-guide', 'cash-drawer-comparison'])
  // 未公開なら次が繰り上がり、同じ記事は2回出ない
  const rest = new Set(everySlug)
  rest.delete('pos-peripherals-guide')
  rest.delete('cash-drawer-comparison')
  assert.deepEqual(diagnosePos(a, rest).devices, ['receipt-printer-comparison', 'scanner-phone-screen-code'])
})

test('every answer changes the result', () => {
  // 2026-11-25 まで、36通りの答えで結果が4種類しかなかった（会計と予算が効いていなかった）
  const all = new Set(allCombos().map((a) => JSON.stringify(diagnosePos(a, everySlug))))
  assert.ok(all.size >= 30, `結果が ${all.size} 種類しかありません`)
  for (const a of allCombos()) {
    const base = JSON.stringify(diagnosePos(a, everySlug))
    for (const q of DIAGNOSIS_QUESTIONS) {
      const changed = q.options.some((o) => o.value !== a[q.id] && JSON.stringify(diagnosePos({ ...a, [q.id]: o.value }, everySlug)) !== base)
      assert.ok(changed, `${q.id} を変えても結果が同じです：${JSON.stringify(a)}`)
    }
  }
})

test('shows two candidates and no posts for another kind of shop', () => {
  for (const a of allCombos()) {
    const r = diagnosePos(a, everySlug)
    assert.equal(r.candidates.length, 2)
    if (a.shop !== 'food') for (const s of ['cafe-mobile-order', 'izakaya-pos']) assert.ok(!r.choose.includes(s))
    if (a.shop !== 'beauty') for (const s of ['salon-reservation-crm', 'salon-pos-comparison']) assert.ok(!r.choose.includes(s))
  }
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
    const ok = postExists(slug)
    assert.ok(ok, `${slug} が content/posts にも scheduled にもありません`)
  }
})

test('journey steps are fixed', () => {
  assert.equal(JOURNEY_STEPS.length, 4)
  assert.deepEqual(JOURNEY_STEPS.map((s) => s.number), [1, 2, 3, 4])
  assert.deepEqual(JOURNEY_STEPS.map((s) => s.path), ['/find', '/devices-guide', '/setup-guide', '/after-opening'])
  for (const s of JOURNEY_STEPS) assert.ok(s.slugs.length >= 4 && s.slugs.length <= 12)
})

test('after-opening shows furniture and tips posts that exist', () => {
  // 4（開業したあと・作業代行）のページの下で、家具と豆知識の記事を紹介する
  const after = JOURNEY_STEPS.find((s) => s.id === 'after')
  assert.deepEqual(after.sections.map((x) => x.title), ['家具', '豆知識'])
  for (const x of after.sections) assert.ok(x.slugs.length >= 4 && x.slugs.length <= 12)
  for (const slug of after.sections.flatMap((x) => x.slugs)) {
    const ok = postExists(slug)
    assert.ok(ok, `${slug} が content/posts にも scheduled にもありません`)
  }
})
