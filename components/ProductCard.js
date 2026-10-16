import AmazonButton from '@/components/AmazonButton';

// 1 製品分の紹介カード（概要・良い点・気になる点・Amazon ボタン）
// headingLevel は見出しの階層（記事の構成に合わせて h3 / h4 を切り替える）
export default function ProductCard({ product, rank, headingLevel = 'h3' }) {
  const Heading = headingLevel;
  return (
    <section className="product-card" id={`product-${rank}`}>
      <div className="product-head">
        <span className="rank">{rank}</span>
        <Heading className="product-name">{product.name}</Heading>
        {product.badge && <span className="badge">{product.badge}</span>}
      </div>
      {product.summary && <p>{product.summary}</p>}
      <div className="pros-cons">
        {product.pros.length > 0 && (
          <div className="pros">
            <h4>良い点</h4>
            <ul>
              {product.pros.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {product.cons.length > 0 && (
          <div className="cons">
            <h4>気になる点</h4>
            <ul>
              {product.cons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <AmazonButton product={product} />
    </section>
  );
}
