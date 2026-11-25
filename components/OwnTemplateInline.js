import Link from 'next/link';

// 記事の本文の途中（目印 <!-- templates --> の所）に出す、運営者が BOOTH で販売しているテンプレートの小さな案内
// 最後の案内（OwnTemplateBox）と同じ「運営者の有料テンプレート」の表示と破線の枠で、アフィリエイト広告とまちがえないようにする
export default function OwnTemplateInline({ templates, lead }) {
  return (
    <aside className="own-service-box own-template-inline" aria-label="運営者の有料テンプレートのご案内">
      <p className="own-service-label">運営者の有料テンプレート（BOOTH で販売）</p>
      {lead && <p className="own-service-lead">{lead}</p>}
      {templates.map((t) => (
        <div key={t.id} className="own-template-inline-item">
          {/* eslint-disable-next-line @next/next/no-img-element -- Static Export のため next/image の最適化は使わない */}
          <img src={t.images[0].src} alt={t.images[0].alt} width="900" height="900" loading="lazy" />
          <div>
            <p className="own-service-name">{t.name}</p>
            <p>{t.catch}</p>
            <p className="own-service-price">{t.price}</p>
          </div>
          <a href={t.boothUrl} className="own-service-button" target="_blank" rel="noopener">
            BOOTH の商品ページを見る
          </a>
          <Link href={`/templates#template-${t.id}`} className="own-template-inline-more">
            先に中身の見本を見る
          </Link>
        </div>
      ))}
    </aside>
  );
}
