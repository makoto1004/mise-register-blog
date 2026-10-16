// サービス紹介のカード（クラウドPOS・決済・会計ソフトなど）
// A8.net のリンクがあれば広告リンク（rel="sponsored"）と計測用の画像、なければ公式サイトへの通常のリンク
export default function ServiceCard({ service, headingLevel = 'h3' }) {
  const Heading = headingLevel;
  return (
    <section className="service-card">
      {service.banner && (
        <a href={service.banner.href} target="_blank" rel="sponsored nofollow noopener" className="service-banner-link">
          {/* eslint-disable-next-line @next/next/no-img-element -- A8.net のバナー画像 */}
          <img src={service.banner.image} alt={service.name} className="service-banner" loading="lazy" />
          {service.banner.pixel && (
            // eslint-disable-next-line @next/next/no-img-element -- A8.net の計測用画像（1×1）
            <img src={service.banner.pixel} width="1" height="1" alt="" className="service-pixel" />
          )}
        </a>
      )}
      <p className="service-group">{service.group}</p>
      <Heading className="service-name">{service.name}</Heading>
      <p className="service-summary">{service.summary}</p>
      <a
        href={service.href}
        className="service-button"
        target="_blank"
        rel={service.isAffiliate ? 'sponsored nofollow noopener' : 'noopener'}
      >
        公式サイトを見る
      </a>
      {service.pixel && (
        // eslint-disable-next-line @next/next/no-img-element -- A8.net の計測用画像（1×1）
        <img src={service.pixel} width="1" height="1" alt="" className="service-pixel" />
      )}
    </section>
  );
}
