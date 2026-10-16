# mise & register（POSレジ・周辺機器の Amazon アフィリエイトブログ）

Next.js（App Router）の Static Export で静的 HTML を生成する、POSレジ周辺機器の比較ブログ。

## 使い方

```bash
npm install
cp .env.example .env.local   # トラッキング ID と公開 URL を設定
npm run dev     # 開発サーバー（http://localhost:3000）
npm run build   # out/ に静的 HTML を出力
npm start       # out/ をローカルで配信して確認
```

`.env.local` の値はビルド時に HTML に埋め込まれるため、変更したらビルドし直す。

| 変数 | 内容 |
| --- | --- |
| `NEXT_PUBLIC_AMAZON_TAG` | Amazon アソシエイトのトラッキング ID（例: `yourname-22`） |
| `NEXT_PUBLIC_SITE_URL` | 公開先 URL（サイトマップ・OGP 用） |

## 記事の追加

`content/posts/` に `.md` ファイルを置く。ファイル名が URL の slug になる（`my-post.md` → `/posts/my-post`）。

```markdown
---
title: 記事タイトル
date: 2026-10-16
updated: 2026-11-01          # 任意
category: cafe               # lib/site.js の CATEGORIES のキー
order: 1                     # 任意。カテゴリー内の表示順
image: /images/my-post.jpg   # 任意。public/ に置いた画像。なければ文字のサムネイル
tags: [タグ1, タグ2]
description: 一覧と検索結果に出る説明文
products:                    # 任意。比較表と商品カードになる
  - name: 製品名
    asin: B0XXXXXXXX         # 任意。あれば商品ページ、なければ keyword で Amazon 検索へリンク
    keyword: 検索キーワード
    badge: 迷ったらこれ       # 任意
    summary: 製品の概要
    specs:                   # 比較表の列（キー: 値）
      用紙幅: 80mm
    pros: [良い点1, 良い点2]
    cons: [気になる点]
---

選び方などの本文

<!-- products -->

まとめなどの本文
```

`<!-- products -->` の位置に「比較表 + 商品カード」が入る（書かなければ本文の末尾）。

## 記事の下書きを AI で生成する

`scripts/generate-draft.mjs` が、キーワードから SEO を意識した比較記事を Claude API（`claude-opus-5-5`）で生成し、`drafts/` に保存する。記事の最後には、トラッキング ID 付きの Amazon ボタン（HTML）が自動で入る。

```bash
# .env.local に ANTHROPIC_API_KEY と NEXT_PUBLIC_AMAZON_TAG を設定しておく
npm run draft -- "スマレジ 周辺機器 Amazon"
npm run draft -- "スマレジ 周辺機器 Amazon" --category cafe   # カテゴリーを指定
npm run draft -- "スマレジ 周辺機器 Amazon" --tag yourname-22   # トラッキング ID を上書き
```

- 生成された下書きは公開対象ではない。フロントマターの `reviewNotes`（事実確認が必要な記述）を確認・修正してから `content/posts/` に移す
- 価格・ASIN は書かせない設定にしている。リンクはすべて Amazon の検索結果ページ
- API の利用料がかかる（1記事あたりの目安は実行後に Claude Console の Usage で確認する）

### 毎朝 8 時に自動で下書きを作る

`keywords.txt` に 1 行 1 キーワードで書いておくと、毎朝 8 時に上から 1 つずつ下書きを生成して `drafts/` に保存する（`scripts/daily-draft.mjs`）。

```bash
npm run draft:daily                          # 手動で 1 件だけ試す
.\scripts\register-daily-task.ps1            # タスク スケジューラに毎日 08:00 で登録
.\scripts\register-daily-task.ps1 -Remove    # 登録を解除
```

- `キーワード | kitchen-car` のように書くとカテゴリーを指定できる
- 成功した行は `keywords.txt` から消える。失敗したら行が残るので、翌朝もう一度試される
- 結果は `logs/daily-draft.log` に残る
- 自動では公開しない。`reviewNotes` を確認してから `content/posts/` に移す
- PC がログオン中のときだけ動く。8 時に電源が切れていた場合は、次に起動したときに実行される

## A8.net のリンクを設定する

POSレジ・キャッシュレス決済・仕入れ・会計ソフト・自動車保険の記事では、`lib/affiliates.js` に登録したサービスを「おすすめのサービス」としてカードで表示する。

1. A8.net でサービスと提携し、承認されたら「広告リンク作成」でテキストリンクを発行する
2. 発行された HTML の `<a href="…">` の URL を `a8.href` に、`<img src="…">` の URL を `a8.pixel` に貼る
3. ビルドし直すと、そのサービスのボタンが A8.net のリンク（rel="sponsored"）になる

`a8.href` が空のサービスは、公式サイトへの通常のリンク（報酬なし）で表示される。

記事側では、フロントマターに `services: [freee, moneyforward]` のようにキーを書き、本文の表示したい位置に `<!-- services -->` を置く（なければ本文の末尾）。

## アフィリエイト関連の表示

- 全ページのフッター：Amazon アソシエイトの必須表示
- 記事の冒頭：「PR」表記（ステマ規制対応）
- 商品リンク：`rel="sponsored nofollow noopener"`、新しいタブで開く
- `/about`：運営者情報・プライバシーポリシー・免責事項（【】の部分を書き換える）
- 価格・商品画像は固定で載せない（Amazon の規約上、静的な価格表示や画像の直リンクは不可。必要なら PA-API や SiteStripe を使う）

## 構成

```
app/layout.js                     共通レイアウト（ヘッダー・カテゴリーナビ・フッター）
app/page.js                       トップページ（記事一覧）
app/posts/[slug]/page.js          記事詳細（比較表・商品カード付き）
app/category/[category]/page.js   カテゴリー別一覧
app/about/page.js                 運営者情報・プライバシーポリシー
app/sitemap.js                    sitemap.xml
components/                       PostCard / ProductCard / ComparisonTable / AmazonButton / TagList
lib/site.js                       サイト名・カテゴリー・Amazon リンク生成
lib/posts.js                      Markdown の読み込み・フロントマター解析・HTML 変換
content/posts/                    記事の Markdown
```
