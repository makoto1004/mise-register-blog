---
title: POSレジ用バーコードリーダー比較｜有線・Bluetooth・2次元コード
date: 2026-10-08
updated: 2026-11-25
category: devices
order: 4
tags: [バーコードリーダー, Bluetooth, Airレジ, Square, スマレジ, S720]
description: バーコードリーダーは、使うレジの公式の一覧にある機種から選びます。Airレジ・Square・スマレジで使える機種、つなぎ方、QRコードが読めるかを表にしました（2026年11月25日確認）。
related: [barcode-scanner-not-reading, scanner-phone-screen-code, hand-scanner-inventory]
reviewNotes:
  - 2026-11-25 に運営者の指示（B の8）で、公式の一覧をもとに書き直した。事実は同じ日に公式ページの原文で確認（サブエージェントが調べ、Claude も主な所を HTML で読んだ）。スマレジの help は読めない（403）ので、周辺機器のページにない機種は「要確認」とした。実機では試していない
  - 前の版でおすすめしていた S700 は、メーカーの公式ページに「販売終了」とあるので外し、3つのレジのページにある S720 にした
  - Square のカメラでの読み取りは公式にあり（日本語の手順は Android のもの）。Airレジは「バーコード入荷」だけ記載を確認。スマレジの今の iPad は確かめられなかった
  - 通販のボタンは Amazon の検索結果。型番ごとの商品ページ（ASIN）は、運営者が商品ページで型番を確かめてから入れる
products:
  - name: Socket Mobile SocketScan S720
    keyword: Socket Mobile S720
    badge: 3つの一覧にある
    summary: iPadなどとBluetoothでつなぐリーダー。バーコードもQRコードも読めます。スマレジの周辺機器のページにあるのは「Smaregiモデル」です。
    specs:
      つなぎ方: Bluetooth
      読めるもの: 1次元・2次元（QRコード）
      Airレジ: 一覧にある
      Square: 一覧にある（iPad・iPhone）
      スマレジ: Smaregiモデルがある
    pros:
      - レジを変えても使える可能性がある
      - QRコードも読める
    cons:
      - スマレジは、モデルを確かめてから買う
  - name: オプトエレクトロニクス OPN-4000i
    keyword: オプトエレクトロニクス OPN-4000i
    summary: Airレジの一覧にある小型のリーダー。名前の似たOPN-4000nは、Airレジに対応していません。
    specs:
      つなぎ方: Bluetooth
      読めるもの: 1次元
      Airレジ: 一覧にある
      Square: 一覧にない
      スマレジ: 要確認
    pros:
      - 小さく持ちやすい
    cons:
      - QRコードは読めない
      - OPN-4000nと間違えやすい
  - name: オプトエレクトロニクス L-46X
    keyword: オプトエレクトロニクス L-46X
    summary: スマレジの周辺機器のページにある、有線のリーダー。スマホ画面のQRコードやパスポートの読み取りに対応と案内されています。メーカーは後継のL-46XSも案内しています。
    specs:
      つなぎ方: USB
      読めるもの: 1次元・2次元（QRコード）
      Airレジ: 一覧にない
      Square: 一覧にない
      スマレジ: 周辺機器のページにある
    pros:
      - 充電がいらない
    cons:
      - Airレジ・Squareの一覧にない
  - name: Honeywell Voyager 1470（2D）
    keyword: Honeywell Voyager 1470g 2D USB
    summary: Squareの一覧にある、有線のリーダー。スタンド・レジスター・ターミナルなどにUSBでつなぎます。
    specs:
      つなぎ方: USB
      読めるもの: 2次元（QRコード）
      Airレジ: 一覧にない
      Square: 一覧にある
      スマレジ: 要確認
    pros:
      - Squareの端末に有線でつなげる
    cons:
      - iPhone・iPadとSquareリーダーの組み合わせでは使えない
---

バーコードリーダーは種類が多くて、どれを選べばいいか迷いますよね。まず、**使うレジの公式の一覧にある機種**にしぼります。そのあと、**QRコードを読むか**で決めます。

![カウンターに並んだ有線・充電台付き・据え置き型の3種類のバーコードリーダーのイラスト](/images/posts/barcode-scanner-comparison-1.webp)

## 先に結論

| 使うレジ | まず見る機種 | 気をつけること |
| --- | --- | --- |
| Airレジ | **S720** | つなげるのは一覧の機種だけ |
| Square | **S720**（iPad・iPhone）か**Voyager 1470**（有線） | 使う端末で、つなげる機種が違う |
| スマレジ | **S720 Smaregiモデル** | モデルを確かめてから買う |
| レジを変えるかもしれない | **S720** | 3つの公式のページにある |
| QRコードも読む | **S720**・**L-46X**・**Voyager 1470** | スマホの画面が読めるかは、機種ごとに確かめる |

**この記事で前に紹介していたS700は、メーカーの販売が終わっています。** 読めるのは1次元のバーコードだけでした。

## 対応の表

| 機種（つなぎ方・QR） | Airレジ | Square | スマレジ |
| --- | --- | --- | --- |
| S720（Bluetooth・QR読める） | ○ | ○ | ○ Smaregiモデル |
| S700（販売終了・QR読めない） | ○ | ○ | 要確認 |
| OPN-4000i（Bluetooth・QR読めない） | ○ | — | 要確認 |
| L-46X（USB・QR読める） | — | — | ○ |
| Voyager 1470（USB・QR読める） | — | ○ | 要確認 |

○＝公式の一覧・周辺機器のページにある、—＝一覧にない。確認日：2026年11月25日。スマレジはくわしい一覧を読めなかったので、周辺機器のページにない機種は「要確認」としました。

## 買う前に確かめる3つのこと

### 1. 使う端末

- **Airレジ**：iPad・iPhoneです。公式には、つなげるのは「下記の機器のみです。他の機種は接続できません」とあります。
- **Square**：BluetoothのリーダーはiPad・iPhoneだけです。USBのリーダーは、スタンド・レジスター・ターミナルなどにつなぎます。
- **スマレジ**：iPadなどのiOS端末です（Androidは使えません）。

### 2. 何を読むか

- **1次元バーコード**：商品のJANコード
- **2次元コード**：QRコード。会員証やスマホ画面のクーポンを読むなら必要です。スマホの画面は[読めるリーダーの選び方](/posts/scanner-phone-screen-code)で紹介しています

### 3. カメラで足りないか

Squareは、端末のカメラで読み取る方法が公式にあります。商品が少ないお店は、先に試してから買っても遅くありません。Airレジは、入荷の作業でカメラを使う案内があります。会計で使えるかは書かれていませんでした。

棚卸しに使うなら[ハンドスキャナーで棚卸しを楽にする方法](/posts/hand-scanner-inventory)、読み取れないときは[確認の手順](/posts/barcode-scanner-not-reading)も参考にしてください。

<!-- products -->

## まとめ

- 使うレジの一覧にある機種から選ぶ。迷ったら、3つの公式のページにあるS720
- QRコードを読むなら、2次元対応の機種
- 名前の似た型番（OPN-4000iとOPN-4000nなど）に気をつける

## 参考にした情報

確認日：2026年11月25日

- Airレジ FAQ「[対応バーコードリーダー一覧](https://faq.airregi.jp/hc/ja/articles/4408637567385)」「[バーコードリーダーの接続](https://faq.airregi.jp/hc/ja/articles/203358580)」「[カメラでの読み取り](https://faq.airregi.jp/hc/ja/articles/7702013839769)」
- Square「[バーコードスキャナーの互換性](https://squareup.com/jp/ja/compatibility/accessories/barcode-scanners)」
- スマレジ「[周辺機器](https://smaregi.jp/hardware/)」
- Socket Mobile「[S720](https://socketmobile.com/jp/products/s720)」「[S700（販売終了）](https://socketmobile.com/jp/products/s700)」

公式の資料をもとにしたもので、実機では試していません。対応は変わることがあるので、買う前に各社の一覧で確かめてください。
