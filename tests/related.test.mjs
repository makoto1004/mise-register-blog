// 同じテーマの記事（lib/related.js）のテスト
import test from 'node:test';
import assert from 'node:assert/strict';
import { pickRelated } from '../lib/related.js';

const P = (slug, category, tags, related = []) => ({ slug, category, tags, related });
// 新しい順に並んでいる前提（getAllPosts と同じ）
const all = [P('a', 'cafe', ['x', 'y']), P('b', 'cafe', []), P('c', 'salon', ['x', 'y']), P('d', 'salon', ['x']), P('e', 'salon', [])];
const slugs = (posts) => posts.map((p) => p.slug);

test('タグの重なりが多い順、同じカテゴリを少し優先、点 0 は出さない', () => {
  const me = P('me', 'cafe', ['x', 'y']);
  assert.deepEqual(slugs(pickRelated(me, [me, ...all])), ['a', 'c', 'd']);
});

test('同点は新しい順（allPosts の並び）', () => {
  const me = P('me', 'salon', []);
  assert.deepEqual(slugs(pickRelated(me, [me, ...all])), ['c', 'd', 'e']);
});

test('related は先に出し、ない slug・自分・重複は飛ばす', () => {
  const me = P('me', 'cafe', ['x', 'y'], ['e', 'nope', 'me', 'e']);
  assert.deepEqual(slugs(pickRelated(me, [me, ...all])), ['e', 'a', 'c']);
});

test('点のある記事がなければ空', () => {
  const me = P('me', 'apparel', ['z']);
  assert.deepEqual(pickRelated(me, [me, ...all]), []);
});
