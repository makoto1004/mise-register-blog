// 運営者が BOOTH で販売している Excel のテンプレート（/templates のページと、記事の最後の案内に使う）
// 記事のフロントマターでは `ownTemplates: [ledger]` のようにキーで指定する。
// 中身は BOOTH の販売ページと同じ事実だけを書く（元の文：ドキュメント\templates\B-sales-summary・C-store-it-ledger の 販売ページ.md）
// ファイルはブログに置かず、BOOTH の商品ページへのリンクだけにする。POS レジの機種名・サービス名は書かない
// 画像は BOOTH の商品画像を 900px の webp にしたもの（架空のカフェの見本データ）

export const OWN_TEMPLATES = {
  ledger: {
    id: 'ledger',
    name: 'お店の IT 管理台帳',
    catch: '機器・保証期限・障害記録・毎日の点検表を、Excel 1 冊に',
    summary:
      'レジまわりの機器の場所と保証・契約の期限、止まったときの記録、毎日・毎月の点検を、1 冊の Excel にまとめて管理できるテンプレートです。',
    features: [
      '機器を 1 台 1 行で記録（管理番号・型番・シリアル番号・階・置き場所・つなぎ方・保証や契約が終わる日など）。期限切れは赤、90日以内はだいだい色で、今日の日付から毎日計算し直します',
      '止まったときは障害記録に 1 件 1 行。その場でしたこと・連絡した先と受付番号・原因・同じことを防ぐ対策を書け、直った日時を入れると止まっていた時間が出ます',
      '1 か月分の点検表に ○・×・休 を付けられます。A4 横 1 枚で印刷して、レジ横で紙のまま使うこともできます',
      '年と月を入れると、その月の障害の件数・止まっていた時間・期限が近い機器の台数などをまとめます',
    ],
    contents: 'Excel 1 冊（シート 8 枚）を、架空のカフェの記入例入りと空のファイルの 2 つ',
    environment: 'Microsoft Excel（Windows 版で動作を確認）／Google スプレッドシート（計算と色分けが同じになることを確認）',
    price: '1,980円（税込）',
    boothUrl: 'https://mise-register.booth.pm/items/9123442',
    images: [
      { src: '/images/templates/ledger-1.webp', alt: '見本：お店の IT 管理台帳の表紙。点検表の 18 日に × が付いている' },
      { src: '/images/templates/ledger-2.webp', alt: '見本：機器台帳。保証が切れた機器は赤、90日以内の機器はだいだい色になっている' },
      { src: '/images/templates/ledger-3.webp', alt: '見本：点検表。18 日の開店前の × から、障害記録の 4 件目につながる' },
      { src: '/images/templates/ledger-4.webp', alt: '見本：障害記録と、10 月のまとめ（障害 4 件・止まっていた時間 1:15）' },
    ],
  },
  sales: {
    id: 'sales',
    name: '売上集計シート',
    catch: 'POS レジの売上明細を貼るだけで、客数・客単価・ABC分析まで',
    summary:
      'POS レジから書き出した売上明細を貼り付け、年と月を入れると、今月と前月の比較や商品別ランキングを自動で集計する Excel のテンプレートです。',
    features: [
      '今月と前月の比較（売上・客数・客単価・営業日数・1日平均と、前月比）',
      '日別・時間帯別・曜日別の売上と、商品別ランキング（ABC分析）・支払い方法ごとの割合',
      '毎日のレジ締めの記録。数えた現金を入れると、差額と「合っています／多い／少ない」が出ます',
      '客数と客単価は、明細に会計番号（レシート番号など）があるときに計算します',
    ],
    contents: '空のシートと、架空のカフェの 2 か月分の見本データ入りのシートの 2 つ',
    environment:
      'Microsoft Excel（Windows 版で動作を確認）／Google スプレッドシート（集計・レジ締めの数字は同じ。グラフのシートは表示が崩れるため、グラフは Excel で見るのがおすすめです）',
    price: '1,980円（税込）',
    boothUrl: 'https://mise-register.booth.pm/items/9123677',
    images: [
      { src: '/images/templates/sales-1.webp', alt: '見本：売上集計シートの表紙と、時間帯別の売上のグラフ' },
      { src: '/images/templates/sales-2.webp', alt: '見本：今月と前月の売上・客数・客単価を比べた表' },
      { src: '/images/templates/sales-3.webp', alt: '見本：商品別ランキングと A・B・C のランク' },
      { src: '/images/templates/sales-4.webp', alt: '見本：明細を書き出して貼り、年と月を入れる 3 ステップ' },
    ],
  },
};

// 記事のフロントマターの ownTemplates（キーの配列）を、表示用のデータにする
export function resolveOwnTemplates(list) {
  if (!Array.isArray(list)) return [];
  return [...new Set(list.map(String))].filter((id) => OWN_TEMPLATES[id]).map((id) => OWN_TEMPLATES[id]);
}
