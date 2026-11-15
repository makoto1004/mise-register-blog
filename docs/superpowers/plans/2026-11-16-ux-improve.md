# ブログの使いやすさの修正 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 記事に目次と同じテーマの記事を出し、受付前の AI 診断への行き止まりを消し、スマホのヘッダーを低くして下の固定バーを「↑」だけにする。

**Architecture:** 目次と関連記事は、テストできる純粋な関数（`lib/toc.js`・`lib/related.js`、`@/` を使わない相対 import）に分け、`lib/posts.js` と記事ページから使う。表示は小さなコンポーネント 2 つ。行き止まりとヘッダーは `app/layout.js`・`app/page.js`・`app/about/page.js`・`app/globals.css` の手直し。

**Tech Stack:** Next.js（Static Export）、remark、素の CSS、`node --test`。

**Spec:** `docs/superpowers/specs/2026-11-16-ux-improve-design.md`

## Global Constraints

- 作業は C:\dev\markdown-blog-ux（ブランチ `ux-improve`）だけ。main には入れない・プッシュしない。
- `npm test` と `npm run build` を通す。新しい依存パッケージは入れない。
- デザイン（色・文字・カードの形）は作り直さない。既存の CSS 変数（`--text` `--muted` `--border` `--line` `--bg` `--warm` など）を使う。
- PC（幅 768px 以上）の見た目は、↑ボタン以外変えない。
- UI の文言とコメントは日本語。

## Review Focus

1. 見出しに太字・リンク・`&amp;` などが入った h2 → 目次の文字はタグなしのふつうの文字になる（Task 1 のテスト）。
2. 同じ文の h2 が 2 つ、または差し込みブロックをはさんで本文が複数の section に分かれる → id が記事全体で重ならない（Task 1・2 のテスト）。
3. h2 が 2 つ以下の記事 → 目次を出さない（Task 2）。
4. `related:` に存在しない slug・自分自身・重複 → 黙って飛ばす（Task 3 のテスト）。
5. 目次のリンクで飛んだ先の見出しが、画面の上に貼り付きすぎない（`scroll-margin-top`）（Task 2）。

---

### Task 1: 見出しに id を付けて目次の項目を取り出す

**Files:**
- Create: `lib/toc.js`
- Test: `tests/toc.test.mjs`

**Interfaces:**
- Produces: `addHeadingIds(html: string, state: { count: number }) => { html: string, headings: Array<{ id: string, text: string }> }`
  - 本文の `<h2>…</h2>`（属性なしの h2 だけ。`class` や `id` が付いた h2 は触らない）に `id="sec-N"` を付ける。N は `state.count` を 1 ずつ増やした番号（1 から）。`state` を記事の全 section で共有するので、番号は記事全体で続く。
  - `text` はタグを取り、`&amp; &lt; &gt; &quot; &#39;` を戻し、前後の空白を取った文字。

- [ ] **Step 1: テストを書く**（`tests/toc.test.mjs`）

```js
test('h2 に順番の id を付け、見出しの文字を返す', () => {
  const s = { count: 0 };
  const r = addHeadingIds('<h2>費用</h2><p>a</p><h2>手続き</h2>', s);
  assert.equal(r.html, '<h2 id="sec-1">費用</h2><p>a</p><h2 id="sec-2">手続き</h2>');
  assert.deepEqual(r.headings, [{ id: 'sec-1', text: '費用' }, { id: 'sec-2', text: '手続き' }]);
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
test('class や id が付いた h2 と h3 は触らない', () => {
  const html = '<h2 class="products-heading">比較表</h2><h3>小</h3>';
  const r = addHeadingIds(html, { count: 0 });
  assert.equal(r.html, html);
  assert.deepEqual(r.headings, []);
});
```

- [ ] **Step 2:** `npm test` → toc のテストが「addHeadingIds がない」で失敗することを確かめる。
- [ ] **Step 3:** `lib/toc.js` に `addHeadingIds` を書く（正規表現 `/<h2>([\s\S]*?)<\/h2>/g` で置き換え）。
- [ ] **Step 4:** `npm test` → 全部 PASS。
- [ ] **Step 5:** コミット「記事の見出しに id を付けて目次の項目を取り出す関数を追加」。

### Task 2: 記事に目次を出す

**Files:**
- Modify: `lib/posts.js`（`getPostBySlug`）
- Create: `components/PostToc.js`
- Modify: `app/posts/[slug]/page.js`、`app/globals.css`

**Interfaces:**
- Consumes: Task 1 の `addHeadingIds`。
- Produces: `getPostBySlug(slug)` の戻り値に `toc: Array<{ id, text }>` を足す。

- [ ] **Step 1:** `getPostBySlug` で、`splitIntoSections` の結果の `type === 'html'` の section を順に `addHeadingIds` に通し（`state` は 1 記事で 1 つ）、`section.html` を置き換え、`headings` を `toc` に集める。
- [ ] **Step 2:** `components/PostToc.js`（`export default function PostToc({ items })`）：`<nav className="post-toc" aria-label="目次">` の中に見出し「目次」と、`<ol>` の各項目 `<a href={'#' + id}>{text}</a>`。最初から開いた形（`details` は使わない）。
- [ ] **Step 3:** 記事ページで、`</header>`（article-hero）の直後に `{post.toc.length >= 3 && <PostToc items={post.toc} />}`。
- [ ] **Step 4:** CSS：`.post-toc` は既存の枠（`--border`・`--bg`）に合わせた控えめな箱。`.post-body h2[id] { scroll-margin-top: 16px; }`。
- [ ] **Step 5:** `npm test` と `npm run build` が通る。`out/posts/prefab-unit-house-shop.html` に `class="post-toc"` と `id="sec-1"` があり、h2 が 2 つ以下の記事には `post-toc` がないことを 1 本確かめる。
- [ ] **Step 6:** コミット「記事のタイトルの下に目次を出す（見出しが 3 つ以上の記事だけ）」。

### Task 3: 同じテーマの記事を選ぶ関数

**Files:**
- Create: `lib/related.js`
- Test: `tests/related.test.mjs`

**Interfaces:**
- Produces: `pickRelated(post, allPosts, count = 3) => Post[]`
  - `post` / `allPosts` の要素は `{ slug, category, tags: string[], related: string[], date, publishedAt? }`。`allPosts` は新しい順に並んでいる前提（`getAllPosts()` の並び）。
  - まず `post.related` の slug を順に、`allPosts` にあり、自分でも重複でもないものだけ入れる。
  - 残りを点で埋める：点 ＝ 重なるタグの数 × 2 ＋（同じカテゴリなら 1）。点 0 は出さない。点の高い順、同点は `allPosts` の並び（新しい順）。
  - 合計 `count` 本まで。

- [ ] **Step 1: テストを書く**

```js
const P = (slug, category, tags, related = []) => ({ slug, category, tags, related });
const all = [P('a', 'cafe', ['x', 'y']), P('b', 'cafe', []), P('c', 'salon', ['x', 'y']), P('d', 'salon', ['x']), P('e', 'salon', [])];
test('タグの重なりが多い順、同じカテゴリを少し優先、点 0 は出さない', () => {
  const me = P('me', 'cafe', ['x', 'y']);
  assert.deepEqual(pickRelated(me, [me, ...all]).map((p) => p.slug), ['a', 'c', 'd']);
});
test('同点は新しい順（allPosts の並び）', () => {
  const me = P('me', 'salon', []);
  assert.deepEqual(pickRelated(me, [me, ...all]).map((p) => p.slug), ['c', 'd', 'e']);
});
test('related は先に出し、ない slug・自分・重複は飛ばす', () => {
  const me = P('me', 'cafe', ['x', 'y'], ['e', 'nope', 'me', 'e']);
  assert.deepEqual(pickRelated(me, [me, ...all]).map((p) => p.slug), ['e', 'a', 'c']);
});
test('点のある記事がなければ空', () => {
  const me = P('me', 'apparel', ['z']);
  assert.deepEqual(pickRelated(me, [me, ...all]), []);
});
```

- [ ] **Step 2:** `npm test` → 失敗を確かめる。
- [ ] **Step 3:** `lib/related.js` に `pickRelated` を書く。
- [ ] **Step 4:** `npm test` → PASS。
- [ ] **Step 5:** コミット「同じテーマの記事を選ぶ関数を追加（タグの重なりと同じカテゴリ）」。

### Task 4: 記事の最後に同じテーマの記事を出す

**Files:**
- Modify: `lib/posts.js`（`normalizeFrontmatter` に `related: toStringList(data.related)`）
- Create: `components/RelatedPosts.js`
- Modify: `app/posts/[slug]/page.js`、`app/globals.css`

**Interfaces:**
- Consumes: Task 3 の `pickRelated`、既存の `getAllPosts`。

- [ ] **Step 1:** `normalizeFrontmatter` に `related` を足す。
- [ ] **Step 2:** `components/RelatedPosts.js`（`export default function RelatedPosts({ posts })`）：`posts` が空なら何も出さない。`<section className="related-posts" aria-labelledby="related-heading">` に見出し「あわせて読みたい記事」と、各記事のカード（既存の `PostThumbnail` があればそれ＋タイトル＋日付、`/posts/<slug>` へのリンク）。
- [ ] **Step 3:** 記事ページで `pickRelated(post, getAllPosts())` を求め、`<PostNav …/>` の直前に置く。
- [ ] **Step 4:** CSS：スマホは縦 1 列、PC は 3 列。既存のカードの線と色に合わせる。
- [ ] **Step 5:** `npm test`・`npm run build` が通る。`out/posts/prefab-unit-house-shop.html` に `related-posts` があり、カードが 1〜3 本あることを確かめる。
- [ ] **Step 6:** コミット「記事の最後に同じテーマの記事を 3 本出す」。

### Task 5: 受付前の AI 診断への行き止まりを消す

**Files:**
- Modify: `app/layout.js`（フッターの `/consult` の `li`）、`app/page.js`（`CONSULT_AVAILABLE` が false のときの `home-help-pending`）、`app/about/page.js`（44 行目と 135 行目のリンク）

- [ ] **Step 1:** フッターの「AI無料POSレジ診断」の `li` を `CONSULT_AVAILABLE &&` で囲む。コメントを「受付を始めるまで出さない」に直す。
- [ ] **Step 2:** トップの `CONSULT_AVAILABLE ? … : <p className="home-help-pending">…</p>` の else を `null` にする。使われなくなった CSS（`.home-help-pending`）があれば消す。
- [ ] **Step 3:** /about の 2 か所：`CONSULT_AVAILABLE` のときだけ `<a href="/consult">`、ほかは文字だけ（「AI無料POSレジ診断」）。説明の文はそのまま。
- [ ] **Step 4:** `npm run build` が通り、`out/index.html` に `/consult` と「準備中です」がないことを確かめる（`CONSULT_OPEN` は false のまま）。
- [ ] **Step 5:** コミット「受付前の AI 診断へのリンクと『準備中』の文を、フッター・トップ・運営者情報から消す」。

### Task 6: スマホのヘッダーを低くし、下の固定バーを「↑」だけにする

**Files:**
- Modify: `app/layout.js`（`bottom-bar` の nav）、`app/globals.css`

- [ ] **Step 1:** `layout.js` の `<nav className="bottom-bar">…</nav>` を消し、`<a href="#top" className="to-top" aria-label="ページの先頭へ">↑</a>` にする。
- [ ] **Step 2:** CSS：`.bottom-bar` の規則を消す。`.to-top` は右下に固定（`right: 16px; bottom: 16px`）、44×44px の丸か四角、`--bg` の背景と `--border` の線。スマホでも PC でも出す。下のバーのために足していた余白（body や footer の `padding-bottom` など）があれば消し、`.checklist-toast-region` の `bottom: 72px` を ↑ と重ならない値に直す。
- [ ] **Step 3:** CSS：幅 767px 以下だけ、ヘッダーの Instagram と X のアイコンを隠し（虫めがねは残す）、ロゴと虫めがねを 1 行、メニュー 4 つを折り返さず 1 行にする（文字を少し小さく・間を詰める。入らない幅では横スクロール）。目安の高さは約 110px。
- [ ] **Step 4:** `npm run build` が通る。`npm start` などで out を開き、幅 390 と 1280 で、トップ・記事のページを撮る。幅 390 でヘッダーの高さを測り（`document.querySelector('.site-header').offsetHeight`）、130px 以下であること、横にはみ出し（`document.documentElement.scrollWidth > 390`）がないことを確かめる。
- [ ] **Step 5:** コミット「スマホのヘッダーを 2 行に低くし、下の固定メニューを『↑』だけにする」。
