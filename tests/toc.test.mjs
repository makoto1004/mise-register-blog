// 記事の目次（lib/toc.js）のテスト：h2 に id を付けて、目次の項目を取り出す
import test from 'node:test';
import assert from 'node:assert/strict';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import { addHeadingIds } from '../lib/toc.js';

test('h2 に順番の id を付け、見出しの文字を返す', () => {
  const s = { count: 0 };
  const r = addHeadingIds('<h2>費用</h2><p>a</p><h2>手続き</h2>', s);
  assert.equal(r.html, '<h2 id="sec-1">費用</h2><p>a</p><h2 id="sec-2">手続き</h2>');
  assert.deepEqual(r.headings, [
    { id: 'sec-1', text: '費用' },
    { id: 'sec-2', text: '手続き' },
  ]);
});

test('section をまたいでも番号が続く（同じ文の見出しでも id が重ならない）', () => {
  const s = { count: 0 };
  addHeadingIds('<h2>まとめ</h2>', s);
  assert.equal(addHeadingIds('<h2>まとめ</h2>', s).headings[0].id, 'sec-2');
});

test('太字・リンク・文字参照は、目次ではふつうの文字にする', () => {
  const r = addHeadingIds('<h2><strong>A</strong> &amp; <a href="/x">B</a></h2>', { count: 0 });
  assert.equal(r.headings[0].text, 'A & B');
});

test('remark が書き出す数値の文字参照（& → &#x26;）も、目次ではふつうの文字にする', async () => {
  const html = String(await remark().use(remarkHtml, { sanitize: false }).process('## レジ & 決済 <まとめ>'));
  const r = addHeadingIds(html, { count: 0 });
  assert.equal(r.headings[0].text, 'レジ & 決済 <まとめ>');
});

test('class や id が付いた h2 と h3 は触らない', () => {
  const html = '<h2 class="products-heading">比較表</h2><h3>小</h3>';
  const r = addHeadingIds(html, { count: 0 });
  assert.equal(r.html, html);
  assert.deepEqual(r.headings, []);
});
