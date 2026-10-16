// 記事で紹介するサービス（クラウドPOS・キャッシュレス決済・仕入れ・会計ソフト・自動車保険）
//
// A8.net で提携が承認されたら、管理画面の「広告リンク作成」で発行されたテキストリンクから
// 次の 2 つをコピーして、そのサービスの a8 に貼る:
//   href  … <a href="https://px.a8.net/svt/ejp?a8mat=XXXX"> の URL
//   pixel … <img src="https://www??.a8.net/0.gif?a8mat=XXXX"> の URL（表示回数の計測用）
//
// a8.href が空のサービスは、公式サイトへの通常のリンク（報酬なし）で表示される。
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
    a8: { href: '', pixel: '' },
  },
  moneyforward: {
    name: 'マネーフォワード クラウド会計',
    group: '会計ソフト',
    summary: '銀行口座やクレジットカードと連携して、明細を自動で取り込めるクラウド会計ソフト。',
    url: 'https://biz.moneyforward.com/accounting/',
    a8: { href: '', pixel: '' },
  },
  yayoi: {
    name: 'やよいの青色申告 オンライン',
    group: '会計ソフト',
    summary: '個人事業主の確定申告向けのクラウド会計ソフト。初めての人向けのサポートが用意されています。',
    url: 'https://www.yayoi-kk.co.jp/',
    a8: { href: '', pixel: '' },
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
      return {
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
