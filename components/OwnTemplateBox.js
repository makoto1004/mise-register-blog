import Link from 'next/link';

// 記事の最後に出す、運営者が BOOTH で販売しているテンプレートの案内
// アフィリエイト広告とまちがえないよう「運営者の有料テンプレート」と明示し、見た目も作業代行の案内（破線の枠）にそろえる
export default function OwnTemplateBox({ templates }) {
  return (
    <aside className="own-service-box" aria-label="運営者のテンプレートのご案内">
      <p className="own-service-label">運営者の有料テンプレート（BOOTH で販売）</p>
      <ul className="own-service-list">
        {templates.map((t) => (
          <li key={t.id}>
            <span className="own-service-name">
              {t.name}
              <br />
              <small>{t.catch}</small>
            </span>
            <span className="own-service-price">{t.price}</span>
          </li>
        ))}
      </ul>
      <Link href="/templates" className="own-service-button">
        テンプレートの中身を見る
      </Link>
    </aside>
  );
}
