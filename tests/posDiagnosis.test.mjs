import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {
  DIAGNOSIS_QUESTIONS,
  DIAGNOSIS_RULES,
  diagnosePos,
} from '../lib/posDiagnosis.js'
import { JOURNEY_STEPS } from '../lib/journey.js'

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
  for (const g of GROUPS) assert.ok(!r[g].includes(target))
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
    const ok = fs.existsSync(`content/posts/${slug}.md`) || fs.existsSync(`scheduled/${slug}.md`)
    assert.ok(ok, `${slug} が content/posts にも scheduled にもありません`)
  }
})

test('journey steps are fixed', () => {
  assert.equal(JOURNEY_STEPS.length, 4)
  assert.deepEqual(JOURNEY_STEPS.map((s) => s.number), [1, 2, 3, 4])
  assert.deepEqual(JOURNEY_STEPS.map((s) => s.path), ['/find', '/devices-guide', '/setup-guide', '/after-opening'])
  for (const s of JOURNEY_STEPS) assert.ok(s.slugs.length >= 4 && s.slugs.length <= 12)
})
