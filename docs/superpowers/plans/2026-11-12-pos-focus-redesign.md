# ブログを「開業前の POS レジ・周辺機器選び」に見直す 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** トップを「開業準備の道のり 1→4」に作りかえ、4つの道のりのページ（診断つきの「探す」を含む）、無料・有料の2つの枠、メニューの見直しを入れる。

**Architecture:** 道のりと診断は `lib/` のデータと純粋な関数に置き（`PURPOSES` と同じく slug の一覧で記事を持つ）、ページはそれを読むだけにする。診断はブラウザだけで動く client component。記事の本文・URL は変えない。

**Tech Stack:** Next.js 16（App Router・Static Export）、React 19、素の CSS（`app/globals.css`）、テストは Node 標準の `node --test`（追加の依存なし）。

**Spec:** `docs/superpowers/specs/2026-11-12-pos-focus-redesign-design.md`（実装する人は必ずこちらも読む）

## Global Constraints

- Static Export のまま。サーバーの処理・API は足さない。
- 記事の URL `/posts/<slug>` と `/category/<slug>` は変えない・消さない。
- 記事の本文とフロントマター（products など）は書きかえない。
- 診断の答えは外に送らない（AI・サーバー・アナリティクスに答えを送らない）。
- 予約の記事（`scheduled/`）は git に入れない。git のプッシュは運営者の指示があるまでしない（コミットまで）。
- 画面の文言は日本語・です/ます・やさしい言葉。色は `globals.css` の `:root` の変数を使う（新しい色は無料の枠の緑だけ。`--pros: #1a7f37` を使う）。
- 新しいページの URL：`/find`（1 POS レジを探す）、`/devices-guide`（2 周辺機器をそろえる）、`/setup-guide`（3 導入ガイド）、`/after-opening`（4 開業したあと）。
- 相談の文言：「相談は最後まで無料です（1か月に3回まで）。相談のあとに料金を請求することはありません。」
- 受付先が未設定のとき（`SITE.consultFormUrl` が空・`SERVICES_OPEN` が false）は、枠を消さず「準備中」と出す。
- スマホ幅 375px で横スクロールが出ないこと。

## Review Focus

- 診断で3つの質問のどれかが未選択のまま「探す」を押した → 結果を出さず「3つとも選んでください」と出す（Task 4 で確認）。
- 診断・道のりのページが案内する記事がまだ公開されていない（`scheduled/` にある）→ リンクにも一覧にも出さない（Task 1 のテスト `filters unpublished slugs`）。
- 答えの組み合わせによって、案内できる記事が0本になる → そのグループは道のりのページの記事へ、全部0本なら無料相談へ案内する（Task 1 のテスト `falls back when a group is empty`）。
- JavaScript の読み込み前・失敗時 → 診断がなくても、業種ごとのリンク（`/category/<slug>`）で探せる（Task 4 で確認）。
- 受付前の環境（`.env.local` に相談フォーム・ココナラの URL がない）でビルドしたとき → 2つの枠が「準備中」になり、`href` が空のリンクができない（Task 3・Task 7 で確認）。

---

### Task 1: 道のりと診断のデータ・関数（テストつき）

**Files:**
- Create: `lib/journey.js`
- Create: `lib/posDiagnosis.js`
- Create: `tests/posDiagnosis.test.mjs`
- Modify: `package.json`（scripts に `"test": "node --test tests/"` を足す）

**Interfaces:**
- Produces:
  - `JOURNEY_STEPS`（`lib/journey.js`）：`[{ id: 'find'|'devices'|'setup'|'after', number: 1..4, name: string, path: string, lead: string, slugs: string[] }]`。name は「POS レジを探す」「周辺機器をそろえる」「導入ガイド」「開業したあと」、path は上の URL、lead はトップの説明（「業種・会計の流れ・予算で比べる」「プリンター・ドロア・スキャナーの相性」「設定・ネットワーク・開店前の確認」「トラブルの直し方・相談」）。slugs は今ある記事から実装する人が選ぶ（各 4〜12 本。POS・周辺機器に近い記事を先に）。
  - `DIAGNOSIS_QUESTIONS`（`lib/posDiagnosis.js`）：`[{ id: 'shop'|'flow'|'budget', label: string, options: [{ value, label }] }]`。選択肢の value と label は spec どおり：shop＝`food` 飲食／`retail` 物販／`beauty` 美容・サービス／`mobile` キッチンカー・イベント、flow＝`prepay` 先に払う（カウンター・券売機）／`postpay` あとで払う（席で注文・テーブルごとに会計）／`reserve` 予約して来店、budget＝`free` まずは無料のアプリとスマホ・タブレットで／`full` 周辺機器もそろえて本格的に／`unknown` まだわからない。
  - `DIAGNOSIS_RULES`（同じファイル）：答えの値ごとに `{ choose: string[], devices: string[], setup: string[] }` の slug を持つ表。運営者が見て直せるよう、このオブジェクト1つにまとめ、上にコメントで見方を書く。
  - `diagnosePos(answers: { shop, flow, budget }, publishedSlugs: Set<string>) => { choose: string[], devices: string[], setup: string[], fallbackToConsult: boolean } | null`
    - 3つのどれかが未選択なら `null`。
    - 各グループは、3つの答えのルールの slug を shop→flow→budget の順につなぎ、重複を除き、`publishedSlugs` にあるものだけ残して先頭 2 本。
    - グループが0本なら、対応する道のりのステップ（choose→find、devices→devices、setup→setup）の `slugs` から公開済みの先頭 2 本で埋める。
    - 3グループとも0本なら `fallbackToConsult: true`。

- [ ] **Step 1: テストを書く** `tests/posDiagnosis.test.mjs`（`node:test` と `node:assert/strict`、`../lib/posDiagnosis.js` と `../lib/journey.js` を import）
  - `returns null when an answer is missing`：`diagnosePos({ shop: 'food', flow: 'prepay' }, set)` が `null`。
  - `returns at most two slugs per group`：36通りすべてで各グループの長さが 2 以下。
  - `filters unpublished slugs`：`publishedSlugs` から1本抜くと、その slug が結果に出ない。
  - `falls back when a group is empty`：`publishedSlugs` を `JOURNEY_STEPS` の slugs だけにしても、各グループは0本にならない。空の Set なら `fallbackToConsult === true`。
  - `every rule slug exists`：`DIAGNOSIS_RULES` と `JOURNEY_STEPS` のすべての slug が `content/posts/<slug>.md` か `scheduled/<slug>.md` にある（`fs.existsSync`）。予約中の記事は入れてよいが、存在しない slug は不可。
  - `journey steps are fixed`：4つ、number が 1〜4、path が Global Constraints の URL。
- [ ] **Step 2: 失敗を確かめる** Run: `npm test` / Expected: モジュールがないので FAIL
- [ ] **Step 3: `lib/journey.js` と `lib/posDiagnosis.js` を書く**（`@/` の別名は使わず、Node からも読める素の ESM にする）
- [ ] **Step 4: 通ることを確かめる** Run: `npm test` / Expected: 6 件 PASS
- [ ] **Step 5: コミット** `git add lib/journey.js lib/posDiagnosis.js tests/posDiagnosis.test.mjs package.json` → `git commit -m "道のり4ステップと POS 診断のデータ・関数を追加（テストつき）"`

### Task 2: 道のりの共通部品と4つのページ

**Files:**
- Create: `components/JourneySteps.js`（トップと各ページ上部の「1→4」の並び。`current` を渡すとその番号に `aria-current="step"`）
- Create: `components/JourneyPostList.js`（slug の一覧から公開済みの記事を `PostCard` で並べる）
- Create: `app/devices-guide/page.js`、`app/setup-guide/page.js`、`app/after-opening/page.js`
- Modify: `app/globals.css`（`.journey-*` のスタイル。トップの mockup B のとおり、左にテラコッタの太線・明朝の番号・白い面）

**Interfaces:**
- Consumes: `JOURNEY_STEPS`（Task 1）、`getAllPosts()`（`lib/posts.js`）
- Produces: `<JourneySteps current?: 'find'|'devices'|'setup'|'after' />`、`<JourneyPostList slugs: string[] />`

- [ ] **Step 1:** 3つのページを作る。各ページ：`metadata`（title と canonical）、上に `JourneySteps current=…`、h1 は step の name、lead、`JourneyPostList`。`/setup-guide` は記事の前に開業準備チェックリスト（`/opening-checklist`）への案内の帯を置く（今のトップの `home-checklist` の帯を移す）。`/after-opening` の記事の下に `HelpChoices`（Task 3）を置く。
- [ ] **Step 2: ビルドで確かめる** Run: `npm run build` / Expected: 成功し、`/devices-guide`・`/setup-guide`・`/after-opening` が出力に並ぶ
- [ ] **Step 3: コミット**（Task 3 と合わせてもよい）

### Task 3: 無料・有料の2つの枠

**Files:**
- Create: `components/HelpChoices.js`
- Modify: `app/globals.css`（`.help-free` は `--pros` の枠、`.help-paid` は `--border` の枠と `--surface` の面）

**Interfaces:**
- Produces: `<HelpChoices />`（引数なし。`SITE.consultFormUrl` と `SERVICES_OPEN` を自分で読む）

- [ ] **Step 1:** 緑の枠：ラベル「無料」、見出し「AI に相談する」、本文「POS レジの選び方・使い方・機器のエラーや障害」、Global Constraints の相談の文言。`consultFormUrl` があれば `/consult` へのボタン「相談してみる」、なければボタンの代わりに「受付の準備中です」。
- [ ] **Step 2:** 茶色の枠：ラベル「有料」、見出し「資料づくりを頼む」、本文「商品データの CSV・マニュアル・売上の集計表など」。受付前でも `/services` へのリンク「できること・できないことを見る」は出す。受付前は「受付の準備中です」も添える。
- [ ] **Step 3: ビルドで確かめる** Run: `npm run build`（`.env.local` に相談・ココナラの URL がない状態）/ Expected: 成功。`out/after-opening.html` に「受付の準備中です」があり、`href=""` がない（`Select-String -Path out\after-opening.html -Pattern 'href=""'` が0件）
- [ ] **Step 4: コミット** `git commit -m "道のりのページ（周辺機器・導入ガイド・開業したあと）と無料・有料の枠を追加"`

### Task 4: 「1 POS レジを探す」ページと診断

**Files:**
- Create: `app/find/page.js`
- Create: `components/PosDiagnosis.js`（`'use client'`）
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `DIAGNOSIS_QUESTIONS`、`diagnosePos`（Task 1）、`JourneySteps`・`JourneyPostList`（Task 2）
- Produces: `<PosDiagnosis posts: { slug, title }[] />`（ページ側で公開済みの記事の slug と title を渡す。client 側で fs は使わない）

- [ ] **Step 1:** `PosDiagnosis`：3つの質問をラジオボタン（`fieldset` と `legend`）で出し、ボタン「合う記事を探す」。未選択があれば結果を出さず「3つとも選んでください」。結果は「POS レジの選び方」「そろえる周辺機器」「つなぎ方の注意」の3つの見出しに記事のリンク。`fallbackToConsult` なら `/consult` への案内。答えは state だけに持ち、送信しない。
- [ ] **Step 2:** `/find` ページ：`JourneySteps current="find"`、h1「POS レジを探す」、`PosDiagnosis`、その下に「業種から探す」（`/category/cafe` など今の業種カテゴリーへのリンク。JS がなくても使える）、`JourneyPostList`（find の slugs）。
- [ ] **Step 3: 動きを確かめる** Run: `npm run build` のあと `out/` をローカルで開き、375px で：未選択のまま押すと注意が出る／3つ選ぶと各見出しに 1〜2 本のリンク／リンク先が開く。
- [ ] **Step 4: コミット** `git commit -m "「POS レジを探す」ページと3つの質問の診断を追加"`

### Task 5: トップページを B 案に作りかえ

**Files:**
- Modify: `app/page.js`
- Modify: `app/globals.css`（使わなくなる `.home-shops` などは消してよい）

**Interfaces:**
- Consumes: `JourneySteps`（Task 2）、`HelpChoices`（Task 3）

- [ ] **Step 1:** 上から：h1「開業前に、POS レジと周辺機器を『つながる組み合わせ』で選ぶ」（`sr-only` のサイト名は残す）、説明「開業準備の順番に、読む記事を並べました。」、`JourneySteps`、`HelpChoices`、新着記事（今のまま）、Excel テンプレートのカード、セールのバナー、運営者の帯。
- [ ] **Step 2:** 外すもの：4業種の絵（`HERO_SHOPS`）、チェックリストの帯（Task 2 で `/setup-guide` に移した）、業種ごとの記事の欄（`sections`）、X の投稿の欄、作業代行・AI 相談のカード（`HelpChoices` に置きかえ）。
- [ ] **Step 3: 確かめる** Run: `npm run build` / Expected: 成功。375px でトップに横スクロールがない（Playwright で `document.documentElement.scrollWidth <= 375`）。
- [ ] **Step 4: コミット** `git commit -m "トップを開業準備の道のり（1→4）に作りかえ"`

### Task 6: メニュー・フッター・サイトの説明・サイトマップ

**Files:**
- Modify: `app/layout.js`（`menu-bar`）、`lib/site.js`（`SITE.catchphrase`・`SITE.description`）、`app/sitemap.js`、`app/site-map/page.js`

- [ ] **Step 1:** ヘッダーのメニューを「探す（/find）／周辺機器（/devices-guide）／導入ガイド（/setup-guide）／開業したあと（/after-opening）／相談（/consult）」の5つにする。業種カテゴリーの並びはメニューから外す。
- [ ] **Step 2:** フッター：「カテゴリから探す」は残す（`/category/<slug>` への入口）。テンプレート・作業代行（受付前も「できること・できないこと」へのリンクとして出す）・お店の数字と管理（`/category/management`）を並べる。
- [ ] **Step 3:** `SITE.catchphrase` を「開業前に、POSレジと周辺機器を『つながる組み合わせ』で選ぶ」、`SITE.description` を「開業準備中の小さなお店向けに、POSレジと周辺機器（プリンター・ドロア・スキャナー・ネットワーク）を、つながる組み合わせで選べるように解説するブログ」にする。
- [ ] **Step 4:** `sitemap.js` に4つのページを足す。`/site-map` のいちばん上に「開業準備の道のりから探す」（4ステップへのリンク）を足す。
- [ ] **Step 5: 確かめる** Run: `npm run build` / Expected: 成功。`out/sitemap.xml` に4つの URL がある。
- [ ] **Step 6: コミット** `git commit -m "メニューを道のりの5つに、フッター・サイトの説明・サイトマップを見直し"`

### Task 7: 相談と代行のページの文言

**Files:**
- Modify: `app/consult/page.js`、`app/services/page.js`

- [ ] **Step 1:** `/consult` の最初の説明の下に、Global Constraints の相談の文言を目立つ枠で置く。「相談できること」は「選び方・使い方・エラーや障害」の3つにまとめなおす（受ける範囲は今のまま。業務用 Android・ネットワーク機器も残す）。「1か月に3回まで」は上の枠と同じ書き方にそろえる。ココナラの見積もり相談への案内があれば、「有料の資料づくり」として `/services` 側に置く。
- [ ] **Step 2:** `/services` に「できないこと」の一覧を足す（例：お店に行って機器をつなぐ作業、POS レジの契約の代行。今のページの内容と重ならないように）。受付前は申し込みのボタンを出さない（今のまま）。
- [ ] **Step 3: 確かめる** Run: `npm run build` と `npm test` / Expected: どちらも成功。受付前の `.env.local` で `out/consult.html` と `out/services.html` に `href=""` がない。
- [ ] **Step 4: コミット** `git commit -m "相談は最後まで無料と明記し、代行のできないことを一覧に"`

### Task 8: 仕上げの確認（運営者に見せる）

- [ ] **Step 1:** `npm test` と `npm run build` が通る。
- [ ] **Step 2:** `out/` をローカルで配信し、Chrome で運営者に見せる（トップ・/find・/devices-guide・/setup-guide・/after-opening・/consult・/services）。Playwright で 375px のスクリーンショットを撮って確かめる。
- [ ] **Step 3:** 運営者の OK が出るまでプッシュしない。
