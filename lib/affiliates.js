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
    a8: { href: '', pixel: '' },
  },
  square: {
    name: 'Square',
    group: 'クラウドPOS・キャッシュレス決済',
    summary: 'POSレジとキャッシュレス決済を一体で使えるサービス。端末の種類が多く、ネットショップや予約の機能とも組み合わせられます。',
    url: 'https://squareup.com/jp/ja',
    a8: { href: '', pixel: '' },
  },
  smaregi: {
    name: 'スマレジ',
    group: 'クラウドPOS',
    summary: '在庫管理や売上分析の機能が充実したPOSレジ。無料プランから始めて、有料プランで機能を広げられます。',
    url: 'https://smaregi.jp/',
    a8: { href: '', pixel: '' },
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
  lowya: {
    name: 'LOWYA（ロウヤ）',
    group: '家具・インテリア通販',
    summary: '家具・インテリアの通販ブランド。テーブル・チェア・ソファ・収納など、デザイン性のある家具をネットで探せます。',
    url: 'https://www.low-ya.com/',
    a8: { href: '', pixel: '' },
  },
  airRhizome: {
    name: 'エア・リゾーム',
    group: '家具・インテリア通販',
    summary: '北欧やナチュラルなど、さまざまなテイストの家具・インテリアを扱う通販ショップ。',
    url: 'https://www.air-r.jp/',
    a8: { href: '', pixel: '' },
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
