import Link from 'next/link';

// 記事の最後に出す、運営者の有料の代行サービスの案内
// アフィリエイト広告とまちがえないよう、「運営者のサービス」と明示し、見た目も広告のカードと分ける
export default function OwnServiceBox({ services }) {
  return (
    <aside className="own-service-box" aria-label="運営者の代行サービスのご案内">
      <p className="own-service-label">運営者の有料サービス</p>
      <p className="own-service-lead">
        「手順は分かったけれど、作業する時間がない」というときは、運営者がメッセージのやりとりだけで代わりに作業します（電話・訪問はありません）。
      </p>
      <ul className="own-service-list">
        {services.map((service) => (
          <li key={service.id}>
            <span className="own-service-name">
              {service.number} {service.name}
            </span>
            <span className="own-service-price">{service.price}</span>
          </li>
        ))}
      </ul>
      <Link href="/services" className="own-service-button">
        サービスの内容と料金を見る
      </Link>
    </aside>
  );
}
