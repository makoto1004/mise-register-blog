import AmazonButton from '@/components/AmazonButton';

// 商品の specs を列にした比較表。列は全商品の specs のキーを登場順に集めたもの
export default function ComparisonTable({ products }) {
  const specKeys = [...new Set(products.flatMap((p) => Object.keys(p.specs)))];

  return (
    <div className="table-scroll">
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
  );
}
