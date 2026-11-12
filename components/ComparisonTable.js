import AmazonButton from '@/components/AmazonButton';

// 表の中で、値が入っているマスの割合がこれより少ないときは、表をやめて「商品ごとの一覧」で見せる
// （iPad・プリンター・ロール紙のように種類のちがう商品を並べると、「—」ばかりの列が増えて読みにくくなるため）
const MIN_FILL_RATIO = 0.6;

// 商品の比較。specs のキーがそろっている商品どうしは表、そろっていないときは商品ごとの一覧にする
export default function ComparisonTable({ products }) {
  const specKeys = [...new Set(products.flatMap((p) => Object.keys(p.specs)))];
  const filled = products.reduce((sum, p) => sum + specKeys.filter((key) => p.specs[key] != null && p.specs[key] !== '').length, 0);
  const total = products.length * specKeys.length;
  const useList = total > 0 && filled / total < MIN_FILL_RATIO;

  if (useList) {
    return (
      <ul className="spec-list">
        {products.map((product, index) => (
          <li key={product.name} className="spec-list-item">
            <p className="spec-list-name">
              <a href={`#product-${index + 1}`}>{product.name}</a>
              {product.badge && <span className="badge">{product.badge}</span>}
            </p>
            {Object.keys(product.specs).length > 0 && (
              <dl className="spec-list-specs">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="spec-list-row">
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <AmazonButton product={product} small />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <p className="scroll-hint" aria-hidden="true">← 横にスクロールできます →</p>
      <div className="table-scroll" role="region" aria-label="製品の比較表（横にスクロールできます）" tabIndex={0}>
      <table className="comparison-table">
        <thead>
          <tr>
            <th>製品</th>
            {specKeys.map((key) => (
              <th key={key}>{key}</th>
            ))}
            <th>リンク</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.name}>
              <th scope="row">
                {product.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- 外部の広告画像をそのまま表示する
                  <img src={product.image} alt="" className="table-thumb" loading="lazy" />
                )}
                <a href={`#product-${index + 1}`}>{product.name}</a>
                {product.badge && <span className="badge">{product.badge}</span>}
              </th>
              {specKeys.map((key) => (
                <td key={key}>{product.specs[key] ?? '—'}</td>
              ))}
              <td>
                <AmazonButton product={product} small />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
