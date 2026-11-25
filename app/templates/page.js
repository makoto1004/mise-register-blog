import Link from 'next/link';
import { OWN_TEMPLATES } from '@/lib/ownTemplates';
import { SERVICES_OPEN } from '@/lib/site';

export const metadata = {
  title: 'お店のテンプレート（POSレジ選び・開店前の設定・売上集計・IT 管理台帳・AI に頼む文集・リモートワークのフロー図）',
  description:
    '開業前の「POSレジ選びワークシート」「開店前のレジ設定チェック表」、開業後の「売上集計シート」「お店の IT 管理台帳」、文章づくりの「AI に頼む文集」、止まったときの「リモートワークのフロー図」。マクロを使わない Excel・PowerPoint・PDF のテンプレートです（BOOTH で販売）。',
  alternates: { canonical: '/templates' },
};

// 運営者が BOOTH で販売しているテンプレートの紹介ページ。ファイルはブログに置かず、BOOTH の商品ページへリンクする
export default function TemplatesPage() {
  const templates = Object.values(OWN_TEMPLATES);

  return (
    <article className="article services-page">
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link> › <span>お店のテンプレート</span>
      </nav>
      <h1 className="page-title">お店のテンプレート</h1>
      <p className="own-service-label">運営者の有料テンプレート（BOOTH で販売）</p>
      <div className="post-body">
        <p>
          ヘルプデスクで POS レジの対応をしている運営者が作った、小さなお店向けのテンプレートです。Excel のテンプレートは、どれもマクロ（自動で動くプログラム）を使わず、数式だけで動きます。開くときに、マクロを許可する画面は出ません。「AI に頼む文集」は PDF とテキストファイル、「リモートワークのフロー図」は PowerPoint と PDF です。
        </p>
        <p>
          購入とダウンロードは、ピクシブ株式会社が運営する BOOTH の商品ページで行います。画像は、架空のお店・会社の見本です。
        </p>
      </div>

      <div className="own-service-grid services-list">
        {templates.map((t) => (
          <section key={t.id} id={`template-${t.id}`} className="own-service-card">
            <h2 className="own-service-card-name">{t.name}</h2>
            <p>
              <strong>{t.catch}</strong>
            </p>
            <p>{t.summary}</p>
            <ul>
              {t.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <table>
              <tbody>
                <tr>
                  <th>価格</th>
                  <td>{t.price}</td>
                </tr>
                <tr>
                  <th>入っているもの</th>
                  <td>{t.contents}</td>
                </tr>
                <tr>
                  <th>動作環境</th>
                  <td>{t.environment}</td>
                </tr>
              </tbody>
            </table>
            <div className="own-service-samples">
              <p className="own-service-samples-title">見本の画面（架空のお店）</p>
              <div className="own-service-samples-list">
                {t.images.map((img) => (
                  <a key={img.src} href={img.src} target="_blank" rel="noopener">
                    <img src={img.src} alt={img.alt} width="900" height="900" loading="lazy" />
                  </a>
                ))}
              </div>
            </div>
            <a href={t.boothUrl} className="own-service-button own-service-card-button" target="_blank" rel="noopener">
              BOOTH の商品ページを見る
            </a>
          </section>
        ))}
      </div>

      <div className="post-body">
        <h2>ご購入の前に</h2>
        <ul>
          <li>ダウンロード商品のため、購入後の返品・返金はお受けしていません。動作環境は、各テンプレートの欄と BOOTH の商品ページでご確認ください。</li>
          <li>ファイルが開けないなどの不具合や、販売者の表記についてのお問い合わせは、BOOTH の商品ページからメッセージでお送りください。</li>
          <li>テンプレートには、パスワードや暗証番号、お客様の個人情報を書かないでください。</li>
        </ul>
        {SERVICES_OPEN && (
          <p>
            お店の POS レジの CSV に合わせた集計表を作ってほしいときは、<Link href="/services">レジまわりの作業代行</Link>
            （②売上集計の Excel シート）でもお受けしています。まずテンプレートを試して、合わなければご相談ください。
          </p>
        )}
      </div>
    </article>
  );
}
