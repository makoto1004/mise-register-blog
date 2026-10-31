// 記事で紹介するサービス（クラウドPOS・キャッシュレス決済・仕入れ・会計ソフト・自動車保険）
//
// A8.net で提携が承認されたら、管理画面の「広告リンク作成」で発行されたテキストリンクから
// 次の 2 つをコピーして、そのサービスの a8 に貼る:
//   href  … <a href="https://px.a8.net/svt/ejp?a8mat=XXXX"> の URL
//   pixel … <img src="https://www??.a8.net/0.gif?a8mat=XXXX"> の URL（表示回数の計測用）
//
// a8.href が空のサービスは、公式サイトへの通常のリンク（報酬なし）で表示される。
//
// バナー画像も出したいときは、A8.net の「広告リンク作成」でバナーを選び、発行された HTML から
//   a8.banner = { href: '<a href> の URL', image: '<img src>（バナー画像）の URL', pixel: '計測用 <img src> の URL' }
// を設定する（バナーはカードの上に小さく表示される）。
// 記事のフロントマターでは `services: [freee, moneyforward]` のようにキーで指定する。

export const SERVICES = {
  // ---- クラウドPOS ----
  airregi: {
    name: 'Airレジ',
    group: 'クラウドPOS',
    summary: 'iPadやiPhoneで使えるPOSレジアプリ。基本機能を無料で始めやすく、決済サービスのAirペイと組み合わせられます。',
    url: 'https://airregi.jp/',
    // バリューコマース「Airレジ」の自由テキストのリンク（2026年10月31日に発行）。
    // 発行された文言「利用店舗数No.1」は、根拠をこちらで確かめていないので使わない（ボタンは「公式サイトを見る」）
    // JavaScript のバナー（pid=892738151・152・159・163・164・173）は、このサイトの作りに合わないので使わない。
    // 画像のバナーは pid=892738166（バリューコマースの画像バナーは、画像そのものが表示回数の計測を兼ねるので pixel はなし）。
    // ほかに使える画像バナー（控え）：pid=892738167・172・173・180・184（どれも href は referral、image は gifbanner の同じ pid）。
    // JavaScript のバナー（174・181・182・183・185・186）も使わない
    // 「利用店舗数No.1」は 2018年1月時点のインテージ調査が根拠（リクルートのプレスリリース）で古い。今の公式サイトは
    // 「利用率No.1」（リクルートがマクロミルに委託したインターネット調査、2026年1月、n=1,037）。どちらもブログには書かない
    a8: {
      href: 'https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3786346&pid=892738150',
      pixel: 'https://ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=3786346&pid=892738150',
      banner: {
        href: 'https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3786346&pid=892738166',
        image: 'https://ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=3786346&pid=892738166',
      },
    },
  },
  square: {
    name: 'Square',
    group: 'クラウドPOS・キャッシュレス決済',
    summary: 'POSレジとキャッシュレス決済を一体で使えるサービス。端末の種類が多く、ネットショップや予約の機能とも組み合わせられます。',
    url: 'https://squareup.com/jp/ja',
    // もしもアフィリエイト「Square」（テキストリンク「アカウント作成」と 971×250 のバナー。2026年10月31日に発行）
    a8: {
      href: 'https://af.moshimo.com/af/c/click?a_id=5857323&p_id=1151&pc_id=1733&pl_id=17641',
      pixel: 'https://i.moshimo.com/af/i/impression?a_id=5857323&p_id=1151&pc_id=1733&pl_id=17641',
      banner: {
        href: 'https://af.moshimo.com/af/c/click?a_id=5857323&p_id=1151&pc_id=1733&pl_id=89423',
        image: 'https://image.moshimo.com/af-img/0400/000000089423.png',
        pixel: 'https://i.moshimo.com/af/i/impression?a_id=5857323&p_id=1151&pc_id=1733&pl_id=89423',
      },
    },
  },
  // もしもアフィリエイト「Square 予約」（テキストリンクと 300×250 のバナー。2026年10月31日に発行）
  // 「[※特定メディア専用] Square予約サイト」のリンクは、特定のメディアだけが使えるものなので使わない
  squarereserve: {
    name: 'Square 予約',
    group: '予約システム',
    summary: 'Square の予約システム。ネットで予約を受け付けられ、Square のPOSレジや決済と組み合わせて使えます。',
    url: 'https://squareup.com/jp/ja/appointments',
    a8: {
      href: 'https://af.moshimo.com/af/c/click?a_id=5857320&p_id=4249&pc_id=10825&pl_id=74716',
      pixel: 'https://i.moshimo.com/af/i/impression?a_id=5857320&p_id=4249&pc_id=10825&pl_id=74716',
      banner: {
        href: 'https://af.moshimo.com/af/c/click?a_id=5857320&p_id=4249&pc_id=10825&pl_id=58170',
        image: 'https://image.moshimo.com/af-img/0400/000000058170.png',
        pixel: 'https://i.moshimo.com/af/i/impression?a_id=5857320&p_id=4249&pc_id=10825&pl_id=58170',
      },
    },
  },
  smaregi: {
    name: 'スマレジ',
    group: 'クラウドPOS',
    summary: '在庫管理や売上分析の機能が充実したPOSレジ。無料プランから始めて、有料プランで機能を広げられます。',
    url: 'https://smaregi.jp/',
    a8: { href: '', pixel: '' },
  },
  // 内容は Shopify の公式サイト（www.shopify.com/jp）で確認（2026年10月28日）
  // 広告リンクは Impact（Shopify のアフィリエイト）で発行したもの。A8.net 以外のリンクも a8.href に入れる（計測用の画像はなし）
  shopify: {
    name: 'Shopify',
    group: 'ネットショップ作成・POS',
    summary: 'ネットショップを作れるコマースのサービス。オンラインストアと実店舗（Shopify POS）の両方で販売でき、決済や商品の発送、お店での販売をひとつの管理画面でまとめられます。料金はプランごとに公式サイトで案内されています。',
    url: 'https://shopify.pxf.io/3kWyyM',
    a8: { href: 'https://shopify.pxf.io/3kWyyM', pixel: '' },
  },
  // 内容は POS+ の公式サイト（www.postas.co.jp）で確認（2026年10月22日）
  postas: {
    name: 'POS+（ポスタス）',
    group: 'クラウドPOS（業種特化型）',
    summary: '飲食店・小売店・美容サロンなど、業種ごとの専用機能を持つクラウド型のPOSレジ。初期設定の支援や操作トレーニング、365日対応のコールセンターなど、導入後のサポートが手厚いのが特徴です。料金は資料で案内されています。',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+5GH2EQ+5OH4+5YJRM',
    // A8.net「POS+（ポスタス）」（テキストリンクと 300×250 のバナー）
    a8: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+5GH2EQ+5OH4+5YJRM',
      pixel: 'https://www13.a8.net/0.gif?a8mat=4BEIP8+5GH2EQ+5OH4+5YJRM',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+5GH2EQ+5OH4+5YZ75',
        image: 'https://www25.a8.net/svt/bgt?aid=261017900330&wid=001&eno=01&mid=s00000026500001003000&mc=1',
        pixel: 'https://www12.a8.net/0.gif?a8mat=4BEIP8+5GH2EQ+5OH4+5YZ75',
      },
    },
  },
  // 内容は LINEヤフー for Business の funfo のページで確認（2026年10月20日）
  funfo: {
    name: 'funfo',
    group: '飲食店向けモバイルオーダー・POSレジ',
    summary: 'モバイルオーダーとPOSレジ、注文管理を1つのアプリにまとめた飲食店向けのサービス。iPad 1台でセルフオーダーを始められ、初期費用・月額は0円からのプランがあります。',
    url: 'https://www.lycbiz.com/jp/service/line-mini-app/package/funfo',
    // A8.net「funfo」（テキストリンクと 300×250 のバナー）
    a8: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+5K1O1E+5RGM+5YJRM',
      pixel: 'https://www14.a8.net/0.gif?a8mat=4BEIP8+5K1O1E+5RGM+5YJRM',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+5K1O1E+5RGM+5ZEMP',
        image: 'https://www27.a8.net/svt/bgt?aid=261017900336&wid=001&eno=01&mid=s00000026887001005000&mc=1',
        pixel: 'https://www18.a8.net/0.gif?a8mat=4BEIP8+5K1O1E+5RGM+5ZEMP',
      },
    },
  },
  // 内容は A8.net の広告文（広告主の案内）の範囲で書いている。公式サイトの内容は未確認
  regichoice: {
    name: 'レジチョイス',
    group: 'POSレジ選びの相談',
    summary: 'お店に合ったPOSレジを無料で紹介してもらえるサービス。どのPOSレジにするか迷っているときの相談先の1つです。',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+5NM9O2+3SPO+1NJK7M',
    // A8.net「レジチョイス」（テキストリンクと 234×60 のバナー。カードの幅に合うサイズを選んでいる）
    a8: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+5NM9O2+3SPO+1NJK7M',
      pixel: 'https://www14.a8.net/0.gif?a8mat=4BEIP8+5NM9O2+3SPO+1NJK7M',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+5NM9O2+3SPO+1NKUI9',
        image: 'https://www20.a8.net/svt/bgt?aid=261017900342&wid=001&eno=01&mid=s00000017718010007000&mc=1',
        pixel: 'https://www11.a8.net/0.gif?a8mat=4BEIP8+5NM9O2+3SPO+1NKUI9',
      },
    },
  },

  // ---- キャッシュレス決済 ----
  airpay: {
    name: 'Airペイ',
    group: 'キャッシュレス決済',
    summary: 'カード・電子マネー・QRコード決済などに対応した決済サービス。Airレジと組み合わせて使えます。',
    url: 'https://airregi.jp/payment/',
    a8: { href: '', pixel: '' },
  },
  storesPayment: {
    name: 'STORES 決済',
    group: 'キャッシュレス決済',
    summary: '小さなお店向けのキャッシュレス決済サービス。STORESのネットショップや予約のサービスと組み合わせられます。',
    url: 'https://stores.fun/payments',
    a8: { href: '', pixel: '' },
  },

  // ---- 会計ソフト ----
  freee: {
    name: 'freee会計',
    group: '会計ソフト',
    summary: '質問に答える形で帳簿をつけられるクラウド会計ソフト。スマホで領収書を撮影して記録できます。',
    url: 'https://www.freee.co.jp/',
    // A8.net「freee会計」（テキストリンクと 300×250 のバナー）
    a8: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+56Y4QA+3SPO+9FDI8Y',
      pixel: 'https://www19.a8.net/0.gif?a8mat=4BEIP8+56Y4QA+3SPO+9FDI8Y',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+56Y4QA+3SPO+9FFFOX',
        image: 'https://www27.a8.net/svt/bgt?aid=261017900314&wid=001&eno=01&mid=s00000017718057011000&mc=1',
        pixel: 'https://www18.a8.net/0.gif?a8mat=4BEIP8+56Y4QA+3SPO+9FFFOX',
      },
    },
  },
  moneyforward: {
    name: 'マネーフォワード クラウド会計',
    group: '会計ソフト',
    summary: '銀行口座やクレジットカードと連携して、明細を自動で取り込めるクラウド会計ソフト。',
    url: 'https://biz.moneyforward.com/accounting/',
    // A8.net「マネーフォワード クラウド」（テキストリンクと 300×250 のバナー）
    a8: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+59BV5E+3SPO+8RK61U',
      pixel: 'https://www11.a8.net/0.gif?a8mat=4BEIP8+59BV5E+3SPO+8RK61U',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+59BV5E+3SPO+8RLO29',
        image: 'https://www28.a8.net/svt/bgt?aid=261017900318&wid=001&eno=01&mid=s00000017718053009000&mc=1',
        pixel: 'https://www14.a8.net/0.gif?a8mat=4BEIP8+59BV5E+3SPO+8RLO29',
      },
    },
  },
  yayoi: {
    name: 'やよいの青色申告 オンライン',
    group: '会計ソフト',
    summary: '個人事業主の確定申告向けのクラウド会計ソフト。初めての人向けのサポートが用意されています。',
    url: 'https://www.yayoi-kk.co.jp/',
    // A8.net「やよいの青色申告オンライン」（テキストリンクと 300×250 のバナー）
    a8: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+58QFJM+35XE+5YJRM',
      pixel: 'https://www11.a8.net/0.gif?a8mat=4BEIP8+58QFJM+35XE+5YJRM',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+58QFJM+35XE+639IP',
        image: 'https://www26.a8.net/svt/bgt?aid=261017900317&wid=001&eno=01&mid=s00000014765001023000&mc=1',
        pixel: 'https://www15.a8.net/0.gif?a8mat=4BEIP8+58QFJM+35XE+639IP',
      },
    },
  },

  // ---- 仕入れ ----
  superdelivery: {
    name: 'スーパーデリバリー',
    group: '仕入れ',
    summary: '事業者向けの卸・仕入れサイト。アパレルや雑貨などの商品を、ネットで仕入れられます。',
    url: 'https://www.superdelivery.com/',
    a8: { href: '', pixel: '' },
  },
  netsea: {
    name: 'NETSEA（ネッシー）',
    group: '仕入れ',
    summary: '事業者向けの卸・仕入れサイト。いろいろなジャンルの商品を、ネットで仕入れられます。',
    url: 'https://www.netsea.jp/',
    a8: { href: '', pixel: '' },
  },

  // ---- 家具・インテリア ----
  // A8.net「labo cafe（ラボカフェ）」のバナー（300×250。2026年10月31日に発行）。
  // 内容はラボカフェ オンラインストア（coffee-labo.co.jp/shop/）で確認（2026年10月31日）：受注焙煎、100g から、お試しセット・定期便あり。
  // 業務用・卸の取引は公式に記載がないので、仕入れ先ではなく「豆の飲み比べ」として紹介する。
  // 発行されたのはバナーだけなので、ボタンは公式サイトへの通常のリンク（テキストのリンクを発行したら a8.href・pixel に入れる）
  labocafe: {
    name: 'labo cafe（ラボカフェ）',
    group: 'コーヒー豆の通販',
    summary: '注文を受けてから焙煎するコーヒー豆の通販。100gから買えて、お試しセットや定期便もあります。',
    url: 'https://coffee-labo.co.jp/shop/',
    a8: {
      href: '',
      pixel: '',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BESUC+FW5L4I+5Y5G+65ME9',
        image: 'https://www20.a8.net/svt/bgt?aid=261031044961&wid=001&eno=01&mid=s00000027754001034000&mc=1',
        pixel: 'https://www17.a8.net/0.gif?a8mat=4BESUC+FW5L4I+5Y5G+65ME9',
      },
    },
  },
  // A8.net「RENOGY（レノジー）」のバナー（300×250。2026年10月31日に発行）。
  // 内容は Renogy JP 公式サイト（jp.renogy.com）で確認（2026年10月31日）：ソーラーパネル・バッテリー・インバーター・充電器・
  // コントローラー・オールインワンキットなど、オフグリッドの電源の機器。トップにポータブル電源は出ていない。
  // バナーは期限のない「エネルギーの自由を、もっと身近に。」を使う（ブラックフライデーのバナー 5ZEMP は 11/15 までなので使わない）。
  // 発行されたのはバナーだけなので、ボタンは公式サイトへの通常のリンク
  renogy: {
    name: 'RENOGY（レノジー）',
    group: '車の電源・ソーラー',
    summary: 'ソーラーパネル・バッテリー・インバーターなど、電力会社の電気を使わずに電源をつくる機器のメーカーです。',
    url: 'https://jp.renogy.com/',
    a8: {
      href: '',
      pixel: '',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BESUD+2Z6SY+5Z96+60H7L',
        image: 'https://www24.a8.net/svt/bgt?aid=261031045005&wid=001&eno=01&mid=s00000027897001010000&mc=1',
        pixel: 'https://www14.a8.net/0.gif?a8mat=4BESUD+2Z6SY+5Z96+60H7L',
      },
    },
  },
  lowya: {
    name: 'LOWYA（ロウヤ）',
    group: '家具・インテリア通販',
    summary: '家具・インテリアの通販ブランド。テーブル・チェア・ソファ・収納など、デザイン性のある家具をネットで探せます。',
    url: 'https://www.low-ya.com/',
    a8: { href: '', pixel: '' },
  },
  // 内容はエア・リゾームの公式サイト（www.air-r.jp）で確認（2026年10月29日）
  airRhizome: {
    name: 'エア・リゾーム',
    group: '家具・インテリア通販',
    summary: '北欧やナチュラルなど、さまざまなテイストの家具・インテリアを扱う通販ショップ。1配送先につき25,000円（税込）以上で送料無料です（北海道・沖縄・離島など一部地域を除く）。法人向けの窓口もあります。',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+64VU7M+2E90+60H7M',
    // A8.net「エア・リゾーム」（テキストリンクと 300×250 のバナー）
    a8: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+64VU7M+2E90+60H7M',
      pixel: 'https://www17.a8.net/0.gif?a8mat=4BEIP8+64VU7M+2E90+60H7M',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+64VU7M+2E90+674EP',
        image: 'https://www21.a8.net/svt/bgt?aid=261017900371&wid=001&eno=01&mid=s00000011178001041000&mc=1',
        pixel: 'https://www18.a8.net/0.gif?a8mat=4BEIP8+64VU7M+2E90+674EP',
      },
    },
  },
  // 内容は KuHoN の公式サイト（kuhon.store）で確認（2026年10月29日）
  kuhon: {
    name: 'KuHoN（クホン）',
    group: '家具・インテリア通販',
    summary: 'デザイナーズ家具を中心にした家具・インテリアのセレクトショップ。全商品送料無料で、1年間の保証が付きます。お店への納品事例やショールーム、インテリアの相談の案内もあります。',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BERA7+CV79F6+5HR6+5YJRM',
    // A8.net「KuHoN」（テキストリンクと 300×250 のバナー）
    a8: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BERA7+CV79F6+5HR6+5YJRM',
      pixel: 'https://www19.a8.net/0.gif?a8mat=4BERA7+CV79F6+5HR6+5YJRM',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BERA7+CV79F6+5HR6+5YZ75',
        image: 'https://www23.a8.net/svt/bgt?aid=261029023778&wid=001&eno=01&mid=s00000025629001003000&mc=1',
        pixel: 'https://www11.a8.net/0.gif?a8mat=4BERA7+CV79F6+5HR6+5YZ75',
      },
    },
  },
  // 内容は MUTUKI の公式サイト（www.mutukistyle.com）で確認（2026年10月29日）
  mutuki: {
    name: 'MUTUKI（ムツキ）',
    group: '家具・インテリア通販',
    summary: 'ソファ・テーブル・テレビ台などを扱う家具・インテリアの通販ショップ。北欧風・和風・モダンなど、いろいろなデザインがそろいます。「あんしん五年間保証」と、法人向けのお問い合わせ窓口があります。',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BERA7+CWE4MQ+2SJG+NTJWY',
    // A8.net「MUTUKI」（テキストリンクと 300×250 のバナー）
    a8: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BERA7+CWE4MQ+2SJG+NTJWY',
      pixel: 'https://www13.a8.net/0.gif?a8mat=4BERA7+CWE4MQ+2SJG+NTJWY',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BERA7+CWE4MQ+2SJG+O0741',
        image: 'https://www29.a8.net/svt/bgt?aid=261029023780&wid=001&eno=01&mid=s00000013030004032000&mc=1',
        pixel: 'https://www11.a8.net/0.gif?a8mat=4BERA7+CWE4MQ+2SJG+O0741',
      },
    },
  },

  // ---- 自動車保険 ----
  insweb: {
    name: 'インズウェブ 自動車保険一括見積もり',
    group: '自動車保険',
    summary: '複数の保険会社の自動車保険の見積もりを、まとめて依頼できるサービス。補償内容と保険料を比べるときに便利です。',
    url: 'https://www.insweb.co.jp/',
    a8: { href: '', pixel: '' },
  },
  hokensquare: {
    name: '保険スクエアbang! 自動車保険',
    group: '自動車保険',
    summary: '複数の保険会社の自動車保険の見積もりを、まとめて比べられるサービス。',
    url: 'https://www.bang.co.jp/',
    a8: { href: '', pixel: '' },
  },

  // ---- セキュリティ ----
  // 内容はトレンドマイクロの公式サイト（個人・家庭向け製品のページ）で確認（2026年10月20日）
  virusbuster: {
    name: 'ウイルスバスター',
    group: 'セキュリティソフト',
    summary: 'トレンドマイクロのセキュリティソフト。Windows・Mac・Android・iOSに対応し、お店で使うパソコンやスマホ、タブレットをまとめて守れる製品があります。',
    url: 'https://www.trendmicro.com/ja_jp/forHome.html',
    // A8.net「ウイルスバスター」（テキストリンクと 300×250 のバナー）
    a8: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+5PEKHE+3A66+5YRHE',
      pixel: 'https://www12.a8.net/0.gif?a8mat=4BEIP8+5PEKHE+3A66+5YRHE',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BEIP8+5PEKHE+3A66+62MDD',
        image: 'https://www28.a8.net/svt/bgt?aid=261017900345&wid=001&eno=01&mid=s00000015315001020000&mc=1',
        pixel: 'https://www13.a8.net/0.gif?a8mat=4BEIP8+5PEKHE+3A66+62MDD',
      },
    },
  },

  // ---- 光回線 ----
  // 内容は A8.net の広告文（広告主の案内）の範囲で書いている。料金・提供エリア・法人契約の条件は公式サイトで確認するよう記事で案内する
  dtihikari: {
    name: 'DTI 光',
    group: '光回線（お店のネット回線）',
    summary: 'NTT東日本・西日本の光回線と、プロバイダーのサービスがセットになった光回線。広告主の案内では、最低利用期間がなく、法人でも契約できるとしています。',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+79YQYA+1QFI+356XJ6',
    // A8.net「DTI 光」（テキストリンクと 300×250 のバナー）
    a8: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+79YQYA+1QFI+356XJ6',
      pixel: 'https://www17.a8.net/0.gif?a8mat=4BELTR+79YQYA+1QFI+356XJ6',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+79YQYA+1QFI+355UY9',
        image: 'https://www25.a8.net/svt/bgt?aid=261021951440&wid=001&eno=01&mid=s00000008091019007000&mc=1',
        pixel: 'https://www19.a8.net/0.gif?a8mat=4BELTR+79YQYA+1QFI+355UY9',
      },
    },
  },
  niftyhikari: {
    name: '@nifty光',
    group: '光回線（お店のネット回線）',
    summary: 'NTT東日本・西日本の光回線と、プロバイダーの@niftyがセットになった光回線。IPv6（IPoE方式）での接続にも対応しています。お店で契約するときの条件は、公式サイトで確かめてみてください。',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+7CXWZ6+447K+BXB8Z',
    // A8.net「@nifty光」（テキストリンクと 300×250 のバナー）
    a8: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+7CXWZ6+447K+BXB8Z',
      pixel: '',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+7CXWZ6+447K+BXYE9',
        image: 'https://www29.a8.net/svt/bgt?aid=261021951445&wid=001&eno=01&mid=s00000019208002006000&mc=1',
        pixel: 'https://www18.a8.net/0.gif?a8mat=4BELTR+7CXWZ6+447K+BXYE9',
      },
    },
  },
  // 内容は BB.excite の公式ページ（bb.excite.co.jp/norikae/next1g/）で確認（2026年10月29日）
  // 料金は戸建て・集合住宅向けの案内で、お店の契約に当てはまるか分からないため書かない
  bbexcitenext: {
    name: 'BB.excite カスタム ネクスト回線',
    group: '光回線（お店のネット回線）',
    summary: 'エキサイトの光回線（回線のみ）。NTT東日本・西日本のフレッツ 光ネクストを使う最大1Gbps（ベストエフォート）の回線で、最低利用期間や違約金はなく、初期費用・工事費は0円と案内されています。インターネットにつなぐには、別にプロバイダーとの契約が必要です。',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+7E4S6Q+7JY+3YW8WI',
    // A8.net「BB.excite カスタム ネクスト回線」（テキストリンクと 300×250 のバナー）
    a8: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+7E4S6Q+7JY+3YW8WI',
      pixel: 'https://www10.a8.net/0.gif?a8mat=4BELTR+7E4S6Q+7JY+3YW8WI',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+7E4S6Q+7JY+3YXYMP',
        image: 'https://www20.a8.net/svt/bgt?aid=261021951447&wid=001&eno=01&mid=s00000000979024009000&mc=1',
        pixel: 'https://www11.a8.net/0.gif?a8mat=4BELTR+7E4S6Q+7JY+3YXYMP',
      },
    },
  },
  // 内容はコミュファ光の公式サイト（www.commufa.jp）で確認（2026年10月28日）
  // 提供する県の名前は公式サイトで確かめられなかったため書かない（住所ごとにエリア検索で確かめる形）
  commufahikari: {
    name: 'コミュファ光（東海地方）',
    group: '光回線（お店のネット回線）',
    summary: '中部テレコミュニケーション（ctc）の、東海地方向けの光回線。提供エリアは一部を除くため、お店の住所が対象かを公式サイトのエリア検索で確かめられます。法人向けには「ビジネスコミュファ」も案内されています。',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+7JHOMQ+5JPQ+5YJRM',
    // A8.net「コミュファ光」（テキストリンクと 300×250 のバナー）
    a8: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+7JHOMQ+5JPQ+5YJRM',
      pixel: 'https://www15.a8.net/0.gif?a8mat=4BELTR+7JHOMQ+5JPQ+5YJRM',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+7JHOMQ+5JPQ+5YZ75',
        image: 'https://www21.a8.net/svt/bgt?aid=261021951456&wid=001&eno=01&mid=s00000025883001003000&mc=1',
        pixel: 'https://www14.a8.net/0.gif?a8mat=4BELTR+7JHOMQ+5JPQ+5YZ75',
      },
    },
  },
  // 内容は BIGLOBE の法人向けページ（biz.biglobe.ne.jp/hikari/）で確認（2026年10月22日）
  biglobehikari: {
    name: 'ビッグローブ光（法人・個人事業主向け）',
    group: '光回線（お店のネット回線）',
    summary: '法人だけでなく個人事業主も申し込める、BIGLOBEの光回線。1ギガと10ギガ（一部エリア）のタイプがあり、法人専用の窓口が申し込みから開通までサポートします。固定IPのオプションもあります（10ギガタイプは対象外）。',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+7GIILU+5OK6+5YJRM',
    // A8.net「ビッグローブ光」（テキストリンクと 300×250 のバナー）
    a8: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+7GIILU+5OK6+5YJRM',
      pixel: 'https://www11.a8.net/0.gif?a8mat=4BELTR+7GIILU+5OK6+5YJRM',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+7GIILU+5OK6+5YZ75',
        image: 'https://www29.a8.net/svt/bgt?aid=261021951451&wid=001&eno=01&mid=s00000026511001003000&mc=1',
        pixel: 'https://www10.a8.net/0.gif?a8mat=4BELTR+7GIILU+5OK6+5YZ75',
      },
    },
  },
  // ---- モバイルWi-Fi ----
  // 内容は比較サイト（セレクトラ）の紹介記事で確認。公式サイトのページは未確認（2026年10月22日）
  bridgewifi: {
    name: 'ブリッジWiFi',
    group: 'モバイルWi-Fi（イベント・予備の回線）',
    summary: 'USBスティック型のWi-Fi端末。月額の契約や充電はいらず、データ容量を買い切って使い、足りなくなったら追加でチャージできます。イベント出店や、お店の回線が止まったときの予備に。',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+6VOCFM+3MKA+1BN3TU',
    // A8.net「ブリッジWiFi」（テキストリンクと 300×250 のバナー）
    a8: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+6VOCFM+3MKA+1BN3TU',
      pixel: 'https://www10.a8.net/0.gif?a8mat=4BELTR+6VOCFM+3MKA+1BN3TU',
      banner: {
        href: 'https://px.a8.net/svt/ejp?a8mat=4BELTR+6VOCFM+3MKA+1BPOF5',
        image: 'https://www28.a8.net/svt/bgt?aid=261021951416&wid=001&eno=01&mid=s00000016921008014000&mc=1',
        pixel: 'https://www16.a8.net/0.gif?a8mat=4BELTR+6VOCFM+3MKA+1BPOF5',
      },
    },
  },
};

// 記事のフロントマターの services（キーの配列）を、表示用のデータにする
// { id: 'freee', note: '…' } の形で、記事ごとの一言を付けることもできる
export function resolveServices(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => (typeof item === 'string' ? { id: item } : item))
    .filter((item) => item && SERVICES[item.id])
    .map(({ id, note }) => {
      const service = SERVICES[id];
      const isAffiliate = Boolean(service.a8?.href);
      const banner = service.a8?.banner?.href && service.a8?.banner?.image ? service.a8.banner : null;
      return {
        banner,
        id,
        name: service.name,
        group: service.group,
        summary: note ? String(note) : service.summary,
        href: isAffiliate ? service.a8.href : service.url,
        pixel: isAffiliate ? service.a8.pixel : '',
        isAffiliate,
      };
    });
}
