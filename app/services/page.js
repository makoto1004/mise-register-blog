import Link from 'next/link';
import { SITE } from '@/lib/site';
import { OWN_SERVICES, COCONALA_CONSULT_URL } from '@/lib/ownServices';

export const metadata = {
  title: 'レジまわりの作業代行（初期設定・商品登録データ・売上集計・操作マニュアル・メニュー表・ホームページ）',
  description:
    'POSレジの初期設定の準備、商品登録用データ、売上集計のシート、レジ操作マニュアル、レジのボタンとそろえたメニュー表、お店紹介のホームページを、メッセージのやりとりだけで作ります。電話・訪問はありません。',
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
    <article className="article services-page">
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
          商品登録・売上集計・操作マニュアルなどを、ヘルプデスク経験のある運営者がお店の代わりに作ります。
        </p>
        <p>
          やりとりは文字のメッセージだけです。<strong>電話・訪問・オンライン面談はありません。</strong>
        </p>

        <h2>サービスの内容と料金の目安</h2>
      </div>

      {/* 広い画面では、左にサービスの一覧を固定し、右で各サービスを同じ形で読めるようにする */}
      <div className="services-layout">
      <nav className="services-index" aria-label="サービスの一覧">
        <ul>
          {services.map((service) => (
            <li key={service.id}>
              <a href={`#service-${service.id}`}>
                <span>
                  {service.number} {service.name}
                </span>
                <span className="services-index-price">{service.price}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="own-service-grid services-list">
        {services.map((service) => (
          <section key={service.id} id={`service-${service.id}`} className="own-service-card">
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
            {service.samples && (
              <div className="own-service-samples">
                <p className="own-service-samples-title">できあがりの見本（架空のお店）</p>
                <div className="own-service-samples-list">
                  {service.samples.map((sample) => (
                    <a key={sample.src} href={sample.src} target="_blank" rel="noopener">
                      <img src={sample.src} alt={sample.alt} width="1200" height="1220" loading="lazy" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {coconala && service.coconalaUrl && (
              <a href={service.coconalaUrl} className="own-service-button own-service-card-button" target="_blank" rel="noopener">
                ココナラの出品ページを見る
              </a>
            )}
          </section>
        ))}
      </div>
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
            <li>
              下のボタンからココナラの出品ページを開き、見積もりのご相談をしてください（無料。ココナラの会員登録が必要です）。①②③⑤⑥はそれぞれの出品ページ、そのほかのサービスや、どれを頼めばよいか迷うときは「レジの困りごとの文字相談」の出品ページからメッセージでご相談ください。
            </li>
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
        <h2>できないこと</h2>
        <ul>
          <li>お店での機器のつなぎ込み・取り付け</li>
          <li>POSレジの契約・申し込みの代行</li>
          <li>機器・レジの購入の代行</li>
          <li>Wi-Fi・ネットワークの工事・配線</li>
        </ul>

        <h2>対応しているPOSレジ</h2>
        <p>
          CSVで商品・売上データを出し入れできるPOSレジに対応します。分からないときは、見積もりでレジの名前を教えてください。
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
        <h3>何を頼むか決まっていなくても、相談できますか？</h3>
        <p>
          はい。見積もりまでは無料です。困っていることをそのまま書いてください。
          {coconala && '「レジの困りごとの文字相談」の出品ページから、メッセージでご相談いただけます。'}
        </p>
        <h3>まだお店を開いていなくても頼めますか？</h3>
        <p>
          はい。メニューや商品の一覧が Excel や紙にあれば、商品登録用のデータを作れます。
        </p>
        <h3>マニュアルの画面の写真は、どうやって用意しますか？</h3>
        <p>
          お店のタブレットで画面を撮り、メッセージで送っていただきます。撮る画面の一覧はこちらからお送りします。できあがったマニュアルは、そのお店の中でお使いください（POSアプリの利用規約で画面の使い方が決められていることがあるためです）。
        </p>
        <h3>初期設定を、そちらで入力までしてもらえますか？</h3>
        <p>
          ログインID・パスワードはお預かりしないため、入力はお店でお願いします。④では、入力する値の一覧表と写真つきの手順書をお渡しし、納品から14日間メッセージで相談できます。
        </p>
        <h3>メニュー表の料理の写真は、用意したほうがいいですか？</h3>
        <p>
          お店で撮った実物の写真を送ってください。ご希望があれば、背景を消して料理だけを切り抜きます。色・明るさの調整やトリミングなど、見た目を変える加工はしません。AI での写真づくりもしません（お客様の誤解につながるため）。文字だけのメニュー表も作れます。
        </p>
        <h3>メニューの価格は、どう書きますか？</h3>
        <p>
          価格は税込みの総額で書きます。テイクアウトとイートインで税率が違う場合は、国税庁の情報を確かめてお店と決めます。
        </p>
        <h3>ホームページの持ち主は、だれになりますか？</h3>
        <p>
          お店です。ファイル一式（HTML・画像）と公開の手順書をお渡しし、お店のサーバーに置いて公開していただきます。ログイン情報はお預かりせず、こちらで公開はしません。サーバーやドメインの費用はお店のご負担です。料理の写真は⑤と同じく、実物のまま使います。
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
        <div className="own-service-cta own-service-cta-list">
          {services
            .filter((service) => service.coconalaUrl)
            .map((service) => (
              <a key={service.id} href={service.coconalaUrl} className="own-service-button" target="_blank" rel="noopener">
                {service.number} {service.name}（ココナラ）
              </a>
            ))}
          <a href={COCONALA_CONSULT_URL} className="own-service-button" target="_blank" rel="noopener">
            レジの困りごとの文字相談・そのほかのご相談（ココナラ）
          </a>
        </div>
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
