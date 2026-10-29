import Link from 'next/link';
import { SITE } from '@/lib/site';
import { OWN_SERVICES } from '@/lib/ownServices';

export const metadata = {
  title: 'レジまわりの作業代行（初期設定・商品登録データ・売上集計・操作マニュアル）',
  description:
    'POSレジの初期設定の準備、商品登録用データづくり、売上集計のスプレッドシート、スタッフ向けのレジ操作マニュアルを、メッセージのやりとりだけで代わりに作ります。電話・訪問はありません。',
  alternates: { canonical: '/services' },
};

// Google フォームの URL から、埋め込み用の URL を作る（?embedded=true を付ける）
function embedUrl(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith('google.com')) return '';
    u.searchParams.set('embedded', 'true');
    return u.toString();
  } catch {
    return '';
  }
}

// 運営者の有料の代行サービスのページ（見積もり依頼 → メールで見積もり → 振込 → 作業 → 納品）
export default function ServicesPage() {
  const src = SITE.orderFormUrl ? embedUrl(SITE.orderFormUrl) : '';
  const services = Object.values(OWN_SERVICES);

  return (
    <article className="article">
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link> › <span>レジまわりの作業代行</span>
      </nav>
      <h1 className="page-title">レジまわりの作業代行</h1>
      <img
        className="consult-hero"
        src="/images/services-desk.webp"
        width={1200}
        height={674}
        alt="チェックリストの紙を持つレシートプリンターのレジまると、棒グラフの紙を持つタブレットのPOSレジのポスタが、表の紙や封筒を置いた作業台に並んでいる手描きのイラスト"
      />
      <p className="own-service-label">運営者の有料サービス</p>
      <div className="post-body">
        <p>
          レジの商品登録や売上の集計、スタッフへの操作説明は、営業の合間にやるには手間がかかりますよね。このページのサービスは、ヘルプデスクでPOSレジの対応をしている運営者が、お店の代わりに作業するものです。
        </p>
        <p>
          やりとりはすべて、フォームとメールの文字だけで進めます。<strong>電話・訪問・オンライン面談はありません。</strong>
        </p>

        <h2>サービスの内容と料金の目安</h2>
      </div>

      <div className="own-service-grid">
        {services.map((service) => (
          <section key={service.id} className="own-service-card">
            <h3 className="own-service-card-name">
              {service.number} {service.name}
            </h3>
            <p>{service.summary}</p>
            <ul>
              {service.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
            <table>
              <tbody>
                <tr>
                  <th>料金の目安</th>
                  <td>
                    {service.price}
                    <br />
                    <small>{service.priceNote}</small>
                  </td>
                </tr>
                <tr>
                  <th>お渡しするもの</th>
                  <td>{service.deliverables}</td>
                </tr>
                <tr>
                  <th>作業の日数</th>
                  <td>お支払いの確認から{service.days}</td>
                </tr>
              </tbody>
            </table>
          </section>
        ))}
      </div>

      <div className="post-body">
        <p className="service-note">
          ※ 表示の料金は、お支払いいただく総額の目安です。正式な金額と納期は、内容をうかがってから見積もりでお伝えします。振込手数料はお客様のご負担です。
        </p>

        <h2>ご依頼の流れ</h2>
        <ol>
          <li>下のフォームから、見積もりを依頼してください（無料）。</li>
          <li>運営者から、料金・納期・作業内容を書いた見積もりをメールでお送りします。分からないところは、メールで質問させていただくことがあります。</li>
          <li>見積もりの内容でよければ、メールでお知らせください。お振込先をお送りします。</li>
          <li>お振込を確認したら、作業を始めます。必要なデータは、メールでお送りいただきます。</li>
          <li>できあがったものをメールでお渡しします。内容の修正は2回まで無料です。</li>
        </ol>

        <h2>対応しているPOSレジ</h2>
        <p>
          Airレジ・Square・スマレジなど、商品データや売上データをCSVで出し入れできるPOSレジに対応します。お使いのレジで対応できるか分からないときは、見積もりの依頼のときにレジの名前を書いてください。
        </p>

        <h2>安心してご依頼いただくために</h2>
        <ul>
          <li>
            <strong>レジや Google アカウントのログインID・パスワードは受け取りません。</strong>
            データの取り出しと取り込みは、手順をお伝えしてお店で行っていただきます。
          </li>
          <li>お客様の名前・電話番号など、お店のお客様の個人情報が入ったデータは送らないでください。入っていた場合は、使わずに削除します。</li>
          <li>お預かりしたデータは、このご依頼の作業だけに使い、納品から30日たったら削除します。</li>
          <li>レジの不具合の修理や、メーカーのサポートの代わりはできません。故障やエラーの相談は、無料の<Link href="/consult">AI相談デスク</Link>や、各メーカーのサポート窓口をご利用ください。</li>
          <li>
            料金・お支払い・キャンセルについては、<Link href="/legal">特定商取引法に基づく表記</Link>をご覧ください。
          </li>
        </ul>

        <h2>よくある質問</h2>
        <h3>まだお店を開いていなくても頼めますか？</h3>
        <p>
          はい、開店前の準備としてご依頼いただけます。メニューや商品の一覧がExcelや紙にまとまっていれば、商品登録用のデータを作れます。
        </p>
        <h3>マニュアルの画面の写真は、どうやって用意しますか？</h3>
        <p>
          お店のタブレットで撮ったスクリーンショットをメールで送っていただくか、運営者が同じPOSアプリの画面で操作をまねして撮影します。売上の金額など、写したくない部分はぼかします。
        </p>
        <h3>初期設定を、そちらで入力までしてもらえますか？</h3>
        <p>
          ログインID・パスワードをお預かりしない方針のため、入力はお店でお願いしています。そのかわり、④の初期設定セットでは、入力する値をすべて決めた一覧表と、画面の写真つきの手順書をお渡しします。詰まったところは、納品から14日間メールでご相談いただけます。
        </p>
        <h3>見積もりのあとで、断ってもいいですか？</h3>
        <p>はい、見積もりまでは無料です。お支払いの前なら、料金はかかりません。</p>
      </div>

      <h2 className="products-heading">見積もりの依頼</h2>
      {src ? (
        <iframe className="contact-frame" src={src} title="作業代行の見積もり依頼フォーム" loading="lazy">
          読み込んでいます…
        </iframe>
      ) : (
        <p className="feedback-box">作業代行の受付は準備中です。</p>
      )}
    </article>
  );
}
