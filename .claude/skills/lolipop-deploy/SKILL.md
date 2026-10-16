---
name: lolipop-deploy
description: 新しいブログ記事を作成し、ビルドしてロリポップにデプロイする
disable-model-invocation: true
allowed-tools: Read, Write, Glob, Bash(gemini:*), Bash(npm run build:*), Bash(scp:*)
---

$ARGUMENTS の内容で新しいブログ記事を作成し、サイトをビルドしてロリポップにデプロイしてください。

## 1. リサーチ

- `gemini --prompt "WebSearch: $ARGUMENTS に関する最新動向"` を実行
- 検索結果から記事に盛り込むべきポイントを整理

## 2. 記事を作成

- content/posts/ 内の既存記事を参照してフォーマットを確認
- リサーチ結果を踏まえ、$ARGUMENTS の内容に基づき、適切な slug をファイル名として決定
- フロントマターに title, date（今日の日付）, tags を設定
- 本文を Markdown で記述し content/posts/ に保存

## 3. ビルド

- `npm run build` を実行して `out/` ディレクトリに静的ファイルを生成
- ビルドが成功したことを確認

## 4. デプロイ

- 以下のコマンドでロリポップにデプロイ:
  scp -P 2222 -i ~/.ssh/id_ed25519 -r out/* アカウント名@ssh.lolipop.jp:web/
  scp -P 2222 -i ~/.ssh/id_ed25519 out/.htaccess アカウント名@ssh.lolipop.jp:web/.htaccess

## 5. 結果を報告

- 作成した記事のファイルパスとタイトル
- デプロイ先のURL
