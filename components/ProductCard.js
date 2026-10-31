import AmazonButton from '@/components/AmazonButton';
import AmazonLiveInfo from '@/components/AmazonLiveInfo';
import { buildAmazonUrl } from '@/lib/site';
import { getAmazonItem } from '@/lib/amazonItems';

// 1 製品分の紹介カード（画像・概要・良い点・気になる点・Amazon ボタン）
// headingLevel は見出しの階層（記事の構成に合わせて h3 / h4 を切り替える）
// 画像はフロントマターの image（SiteStripe の画像・自分で撮った写真など、使用が認められたものだけ）。
// ないときは、ASIN があれば Creators API の画像を出す。価格も ASIN があれば出す（components/AmazonLiveInfo）
export default function ProductCard({ product, rank, headingLevel = 'h3' }) {
  const Heading = headingLevel;
  const live = getAmazonItem(product.asin);
  return (
    <section className="product-card" id={`product-${rank}`}>
      <div className="product-head">
        <span className="rank">{rank}</span>
        <Heading className="product-name">{product.name}</Heading>
        {product.badge && <span className="badge">{product.badge}</span>}
      </div>
      <div className={product.image || live?.image ? 'product-body has-image' : 'product-body'}>
        {!product.image && live && <AmazonLiveInfo item={live} alt={product.name} part="image" />}
        {product.image && (
          <a href={buildAmazonUrl(product)} target="_blank" rel="sponsored nofollow noopener" className="product-thumb-link">
            {/* eslint-disable-next-line @next/next/no-img-element -- 外部の広告画像をそのまま表示する */}
            <img src={product.image} alt={product.name} className="product-thumb" loading="lazy" />
          </a>
        )}
        {product.imagePixel && (
          // eslint-disable-next-line @next/next/no-img-element -- SiteStripe の計測用画像（1×1）
          <img src={product.imagePixel} width="1" height="1" alt="" className="service-pixel" />
        )}
        {product.summary && <p className="product-summary">{product.summary}</p>}
      </div>
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
      {live && <AmazonLiveInfo item={live} part="price" />}
      <AmazonButton product={product} />
    </section>
  );
}
