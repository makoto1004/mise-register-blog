// 開業準備チェックリスト（/opening-checklist）の項目
// 段階（stages）は上から順に進める想定。各項目の links は関連する公開済みの記事の slug と、ボタンに出す短い名前
// 記事が見つからない slug は、ページ側で自動的に外す（リンク切れを作らない）
// 項目の id はブラウザに保存するチェックの状態と結びつくので、あとから変えない

export const OPENING_STAGES = [
  {
    id: 'shape',
    name: 'お店の形を決める',
    items: [
      {
        id: 'concept',
        title: 'お店のコンセプトを決める',
        text: 'だれに、何を、どんな雰囲気で届けるかを一文にします。機器や内装を選ぶときの軸になります。',
        links: [{ slug: 'cafe-concept-types', label: 'カフェのコンセプト' }],
      },
      {
        id: 'property',
        title: '物件の条件を決める',
        text: '立地・広さ・電気や水まわりの設備など、ゆずれない条件を書き出してから探します。',
        links: [
          { slug: 'cafe-property-guide', label: 'カフェ' },
          { slug: 'salon-property-guide', label: '美容室' },
          { slug: 'apparel-property-guide', label: 'アパレル' },
        ],
      },
      {
        id: 'permits',
        title: '必要な届出と許可を確かめる',
        text: '業種によって必要な届出や許可がちがいます。税務署・保健所など、公式の窓口の案内で確かめましょう。',
        links: [],
      },
    ],
  },
  {
    id: 'money',
    name: 'お金の準備',
    items: [
      {
        id: 'initial-cost',
        title: '初期費用の目安を出す',
        text: 'レジまわりは、最低限から始めて、あとで足すこともできます。',
        links: [{ slug: 'pos-low-cost-start', label: '初期費用を抑える方法' }],
      },
      {
        id: 'accounting',
        title: '会計ソフトを選ぶ',
        text: '売上の記録とレジのデータをつなげられると、毎日の入力が減ります。',
        links: [
          { slug: 'cafe-accounting-software', label: 'カフェ' },
          { slug: 'salon-accounting-software', label: '美容室' },
          { slug: 'kitchen-car-accounting-software', label: 'キッチンカー' },
          { slug: 'apparel-accounting-software', label: 'アパレル' },
        ],
      },
      {
        id: 'receipt',
        title: 'レシートと領収書の書き方を確かめる',
        text: 'インボイスの登録をするかどうかで、レシートに入れる項目が変わります。',
        links: [{ slug: 'receipt-invoice-for-shops', label: 'レシートとインボイス' }],
      },
    ],
  },
  {
    id: 'register',
    name: 'レジと決済をそろえる',
    items: [
      {
        id: 'pos',
        title: 'POSレジを選ぶ',
        text: '業種で必要な機能がちがいます。予約・在庫・軽減税率など、お店に要るものから比べます。',
        links: [
          { slug: 'cafe-pos-comparison', label: 'カフェ' },
          { slug: 'salon-pos-comparison', label: '美容室' },
          { slug: 'apparel-pos-comparison', label: 'アパレル' },
        ],
      },
      {
        id: 'cashless',
        title: 'キャッシュレス決済を選ぶ',
        text: '手数料と入金のタイミングを、お店の客単価に合わせて比べます。',
        links: [
          { slug: 'cafe-cashless', label: 'カフェ' },
          { slug: 'salon-cashless', label: '美容室' },
          { slug: 'kitchen-car-cashless', label: 'キッチンカー' },
          { slug: 'apparel-cashless', label: 'アパレル' },
        ],
      },
      {
        id: 'peripherals',
        title: '周辺機器をそろえる',
        text: 'プリンター・ドロア・スタンドなどは、使うレジに対応している機種を選びます。',
        links: [
          { slug: 'pos-peripherals-guide', label: '周辺機器のまとめ' },
          { slug: 'receipt-printer-comparison', label: 'レシートプリンター' },
        ],
      },
      {
        id: 'network',
        title: 'お店のネットワークを整える',
        text: 'Wi-Fi が止まると会計も止まります。ルーターと配線を先に決めておきます。',
        links: [
          { slug: 'store-wifi-router', label: 'Wi-Fiルーター' },
          { slug: 'store-network-setup', label: '配線ガイド' },
        ],
      },
    ],
  },
  {
    id: 'opening',
    name: '開店の準備',
    items: [
      {
        id: 'setup',
        title: 'レジの初期設定をする',
        text: '税率・支払い方法・スタッフなど、開店前に決めることを順番に設定します。',
        links: [{ slug: 'pos-initial-setup-guide', label: '初期設定ガイド' }],
      },
      {
        id: 'products',
        title: '商品を登録する',
        text: 'カテゴリーを先に決めておくと、会計の画面が探しやすくなります。',
        links: [
          { slug: 'airregi-product-registration', label: 'Airレジ' },
          { slug: 'smaregi-product-group-code', label: 'スマレジ' },
        ],
      },
      {
        id: 'security',
        title: '防犯の備えをする',
        text: 'レジのまわりと出入口から、できることを決めておきます。',
        links: [
          { slug: 'store-crime-prevention', label: '防犯グッズ' },
          { slug: 'business-safe-guide', label: '業務用金庫' },
        ],
      },
      {
        id: 'rehearsal',
        title: '開店日の流れを練習する',
        text: '開店準備から締めまでを一度通しておくと、当日あわてずにすみます。',
        links: [{ slug: 'airregi-daily-workflow', label: 'Airレジの1日の流れ' }],
      },
      {
        id: 'trouble',
        title: '困ったときの確かめ方を知っておく',
        text: 'レシートが出ないなど、よくあるトラブルの確認の順番を見ておきます。',
        links: [{ slug: 'receipt-printer-not-printing', label: 'プリンターが印刷できない' }],
      },
    ],
  },
];
