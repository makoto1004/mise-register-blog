import Link from 'next/link';
import { SITE } from '@/lib/site';
import { OWN_SERVICES } from '@/lib/ownServices';

export const metadata = {
  title: 'レジまわりの作業代行（初期設定・商品登録データ・売上集計・操作マニュアル・メニュー表）',
  description:
    'POSレジの初期設定の準備、商品登録用データ、売上集計のシート、レジ操作マニュアル、レジのボタンとそろえたメニュー表を、メッセージのやりとりだけで作ります。電話・訪問はありません。',
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

// 運営者の有料の代行サービスのページ。最初はココナラで受け（見積もり相談 → 購入 → 作業 → 見本 → 納品）、
// ブログで直接受けるときは見積もり依頼 → 作業 → 見本 → 後払いの振込 → 納品
export default function ServicesPage() {
  // 最初はココナラで受ける。ココナラの URL があれば、ブログの見積もり依頼フォームより優先する
  const coconala = SITE.coconalaUrl;
  const src = !coconala && SITE.orderFormUrl ? embedUrl(SITE.orderFormUrl) : '';
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
          やりとりはすべて、文字のメッセージだけで進めます。<strong>電話・訪問・オンライン面談はありません。</strong>
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
                  <td>ご依頼の確定から{service.days}で見本をお送りします</td>
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
      </div>
      {coconala ? (
        <div className="post-body">
          <ol>
            <li>下のボタンからココナラの出品ページを開き、見積もりのご相談をしてください（無料。ココナラの会員登録が必要です）。</li>
            <li>ココナラのメッセージで、料金・納期・作業内容をお伝えします。</li>
            <li>内容でよければ、ココナラでご購入ください。代金はココナラがいったん預かり、取引が終わるまで運営者には支払われません。</li>
            <li>作業をして、確認用の見本をお送りします。内容の修正は2回まで無料です。</li>
            <li>ご納得いただけたら完成品をお渡しします。ココナラで取引を完了してください。</li>
          </ol>
          <p>
            ④POSレジの初期設定セットは、手順書と商品登録用のデータでお店で実際に設定していただき、手順書どおりに設定できたことを確かめてから、取引を完了してください。
          </p>
          <p>ご依頼のやりとり・お支払い・キャンセルは、すべてココナラの仕組みと利用規約に従います。</p>
        </div>
      ) : (
      <div className="post-body">
        <ol>
          <li>下のフォームから、見積もりを依頼してください（無料）。</li>
          <li>運営者から、料金・納期・作業内容を書いた見積もりをメールでお送りします。分からないところは、メールで質問させていただくことがあります。</li>
          <li>見積もりの内容でよければ、メールでお知らせください。作業を始めます。必要なデータは、メールでお送りいただきます。</li>
          <li>できあがったら、まず確認用の見本（透かし入りのPDFや画面の写真）をお送りします。内容の修正は2回まで無料です。</li>
          <li>見本を見てご納得いただけたら、お振込をお願いします（後払い）。お振込先は見本と一緒にお知らせします。</li>
          <li>お振込を確認したら、完成品（編集できるファイル・CSVなど）をメールでお渡しします。</li>
        </ol>
        <p>
          ④POSレジの初期設定セットは、手順書（PDF）と商品登録用のデータを先にお渡しします。お店で実際に設定していただき、手順書どおりに設定できたことを確かめてからのお支払いです。設定で詰まったところは、メールでご相談ください。
        </p>
        <p>
          料金・お支払い・キャンセルについては、<Link href="/legal">特定商取引法に基づく表記</Link>をご覧ください。
        </p>
      </div>
      )}

      <div className="post-body">
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
          <li>お預かりしたデータは、このご依頼の作業だけに使い、納品から30日たったら削除します。ほかのお客様の作業、ブログの記事、SNSの投稿には使いません。</li>
          <li>
            作業には AI サービス（Anthropic の Claude）を使います。送った内容が AI の学習に使われない設定で使い、できあがったものは運営者がすべて確認し、実際に動かしてからお渡しします。
          </li>
          <li>⑤のメニュー表は Canva で作るため、メニューの文字と料理の写真を Canva に送ります。それ以外のご依頼のデータは Canva に送りません。</li>
          <li>レジの不具合の修理や、メーカーのサポートの代わりはできません。故障やエラーの相談は、無料の<Link href="/consult">AI相談デスク</Link>や、各メーカーのサポート窓口をご利用ください。</li>
        </ul>

        <h2>よくある質問</h2>
        <h3>まだお店を開いていなくても頼めますか？</h3>
        <p>
          はい、開店前の準備としてご依頼いただけます。メニューや商品の一覧がExcelや紙にまとまっていれば、商品登録用のデータを作れます。
        </p>
        <h3>マニュアルの画面の写真は、どうやって用意しますか？</h3>
        <p>
          お店のPOSアプリの画面を、お店のタブレットでスクリーンショットに撮って、メッセージで送っていただきます。撮ってほしい画面の一覧はこちらからお送りします。できあがったマニュアルは、そのお店の中でお使いください（POSアプリの利用規約で、画面の使い方が決められていることがあるためです）。
        </p>
        <h3>初期設定を、そちらで入力までしてもらえますか？</h3>
        <p>
          ログインID・パスワードをお預かりしない方針のため、入力はお店でお願いしています。そのかわり、④の初期設定セットでは、入力する値をすべて決めた一覧表と、画面の写真つきの手順書をお渡しします。詰まったところは、納品から14日間メッセージでご相談いただけます。
        </p>
        <h3>メニュー表の料理の写真は、用意したほうがいいですか？</h3>
        <p>
          写真を入れる場合は、お店で撮った実物の写真を送ってください。いただいた写真は、メニュー表の大きさに合わせて拡大・縮小するだけで、明るさや色の調整、切り抜き、トリミングなどの加工は一切しません。AI で料理の写真を作ることもしません。実物と違う見た目になると、お客様の誤解につながるためです。写真なしの、文字だけのメニュー表も作れます。
        </p>
        <h3>メニューの価格は、どう書きますか？</h3>
        <p>
          お客様に見せる価格は、税込みの総額で書きます。テイクアウトとイートインで税率が違う場合の書き方は、国税庁の情報で確かめてから、お店と相談して決めます。
        </p>
        <h3>見積もりのあとで、断ってもいいですか？</h3>
        <p>
          はい、見積もりまでは無料です。
          {coconala
            ? '代金はココナラがいったん預かり、できあがったものを確かめていただいてから取引が完了します。'
            : 'お支払いは、できあがったものの見本を見てご納得いただいてからの後払いです。'}
        </p>
      </div>

      <h2 className="products-heading">{coconala ? 'ご依頼・ご相談' : '見積もりの依頼'}</h2>
      {coconala ? (
        <p className="own-service-cta">
          <a href={coconala} className="own-service-button" target="_blank" rel="noopener">
            ココナラの出品ページで相談する
          </a>
        </p>
      ) : src ? (
        <iframe className="contact-frame" src={src} title="作業代行の見積もり依頼フォーム" loading="lazy">
          読み込んでいます…
        </iframe>
      ) : (
        <p className="feedback-box">作業代行の受付は準備中です。</p>
      )}
    </article>
  );
}
