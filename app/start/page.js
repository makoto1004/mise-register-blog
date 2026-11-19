import Link from 'next/link';
import { OWN_TEMPLATES } from '@/lib/ownTemplates';
import { OWN_SERVICES, COCONALA_CONSULT_URL } from '@/lib/ownServices';
import { SERVICES_OPEN } from '@/lib/site';

// X（旧 Twitter）のプロフィールから来た人向けの入口ページ。
// 「無料のチェック表 → 有料テンプレート → 作業代行」の順に案内し、どこまで進んだかを GA で見る
// （ダウンロードは file_download、BOOTH・ココナラへのリンクは own_link_click で数える）。
// 検索結果には出さない（ほかのページと中身が重なるため）。サイトマップにも入れない
export const metadata = {
  title: 'はじめての方へ（レジまわりの準備）',
  description: 'レジ締めチェック表（無料）・お店のテンプレート・レジまわりの作業代行の案内です。',
  alternates: { canonical: '/start' },
  robots: { index: false, follow: true },
};

// 2 番目の段で紹介するテンプレート（開業前・開業後の代表だけ。ほかは /templates へ）
const START_TEMPLATES = [
  { key: 'set', when: '開業前' },
  { key: 'sales', when: '開業後' },
  { key: 'ledger', when: '開業後' },
];

export default function StartPage() {
  const templates = START_TEMPLATES.map((t) => ({ ...OWN_TEMPLATES[t.key], when: t.when })).filter((t) => t.id);
  const services = Object.values(OWN_SERVICES);

  return (
    <article className="article services-page start-page">
      <h1 className="page-title">はじめての方へ</h1>
      <div className="post-body">
        <p>
          X で見つけてくださって、ありがとうございます。mise &amp; register は、これからお店を開く方と小さなお店に向けて、レジまわりの準備をまとめているサイトです。
        </p>
        <p>まずは無料のチェック表から。合いそうなものがあれば、その先もどうぞ。</p>
      </div>

      <section className="start-step" aria-labelledby="start-step-1">
        <p className="start-step-number">1</p>
        <div className="start-step-body">
          <h2 id="start-step-1">まずは無料で：レジ締めチェック表</h2>
          <p>閉店後の現金が合わないときに、確かめる順番を 1 枚にした表です。印刷用の PDF と、枚数を入れると合計と差額が出る Excel があります。</p>
          <ul className="own-service-cta-list">
            <li>
              <a href="/downloads/register-closing-checklist.pdf" className="own-service-button" download>
                PDF をダウンロード
              </a>
            </li>
            <li>
              <a href="/downloads/register-closing-checklist.xlsx" className="own-service-button" download>
                Excel をダウンロード
              </a>
            </li>
          </ul>
          <p>
            使い方の説明：<Link href="/posts/register-cash-mismatch">レジ締めで現金が合わないときの確認手順</Link>
          </p>
        </div>
      </section>

      <section className="start-step" aria-labelledby="start-step-2">
        <p className="start-step-number">2</p>
        <div className="start-step-body">
          <h2 id="start-step-2">自分で進めたい方に：お店のテンプレート</h2>
          <p>マクロを使わない Excel のテンプレートです（BOOTH で販売）。画像は架空のお店の見本です。</p>
          <div className="own-service-grid">
            {templates.map((t) => (
              <section key={t.id} className="own-service-card">
                <p className="own-service-label">{t.when}</p>
                <h3 className="own-service-card-name">{t.name}</h3>
                <p>{t.catch}</p>
                <img src={t.images[0].src} alt={t.images[0].alt} width="900" height="900" loading="lazy" />
                <p className="own-service-price">{t.price}</p>
                <a href={t.boothUrl} className="own-service-button own-service-card-button" target="_blank" rel="noopener">
                  BOOTH の商品ページを見る
                </a>
              </section>
            ))}
          </div>
          <p>
            ほかのテンプレート（POSレジ選び・AI に頼む文集など）は<Link href="/templates">お店のテンプレート</Link>の一覧にあります。
          </p>
        </div>
      </section>

      {SERVICES_OPEN && (
        <section className="start-step" aria-labelledby="start-step-3">
          <p className="start-step-number">3</p>
          <div className="start-step-body">
            <h2 id="start-step-3">手が回らない方に：レジまわりの作業代行</h2>
            <p>お店に合わせて作ります。ご依頼はココナラから受け付けています。ログイン情報はお預かりしません。</p>
            <ul className="start-service-list">
              {services.map((s) => (
                <li key={s.id}>
                  <span>
                    {s.number} {s.name}
                  </span>
                  <span className="start-service-price">{s.price}</span>
                </li>
              ))}
            </ul>
            <ul className="own-service-cta-list">
              <li>
                <Link href="/services" className="own-service-button">
                  作業代行の詳しい内容を見る
                </Link>
              </li>
              <li>
                <a href={COCONALA_CONSULT_URL} className="own-service-button" target="_blank" rel="noopener">
                  どれを頼むか迷ったら（ココナラで相談）
                </a>
              </li>
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
