import test from 'node:test';
import assert from 'node:assert/strict';
import { addImageAttributes, localImageSize } from '../lib/imageSize.js';

test('サイトの中の webp の幅と高さが分かる', () => {
  assert.deepEqual(localImageSize('/images/posts/cafe-pos-comparison-1.webp'), { width: 1200, height: 675 });
  assert.equal(localImageSize('/images/posts/nai-gazou.webp'), null);
  assert.equal(localImageSize('https://example.com/a.webp'), null);
});

test('1 枚目はすぐ、2 枚目からは遅らせて読む。記事で枚数を通す', () => {
  const state = {};
  const first = addImageAttributes('<p><img src="/images/posts/cafe-pos-comparison-1.webp" alt="a"></p>', state);
  assert.match(first, /width="1200" height="675"/);
  assert.doesNotMatch(first, /loading/);
  const second = addImageAttributes('<img src="https://example.com/b.png" alt="b">', state);
  assert.match(second, /loading="lazy" decoding="async"/);
  assert.doesNotMatch(second, /width=/);
});

test('付いている属性とマスコットは変えない', () => {
  const state = { images: 1 };
  const tag = '<img src="/images/posts/cafe-pos-comparison-1.webp" width="10" loading="eager" alt="">';
  assert.equal(addImageAttributes(tag, state), tag);
  const mascot = '<img src="/images/mascots/x.webp" alt="">';
  assert.equal(addImageAttributes(mascot, state), mascot);
});
