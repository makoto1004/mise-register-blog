import { buildAmazonUrl } from '@/lib/site';

// Amazon への商品リンクボタン（アフィリエイトリンクなので rel="sponsored" を付ける）
export default function AmazonButton({ product, small = false }) {
  return (
    <a
      href={buildAmazonUrl(product)}
      className={small ? 'amazon-button small' : 'amazon-button'}
      target="_blank"
      rel="sponsored nofollow noopener"
    >
      {small ? 'Amazonで見る' : 'Amazonで価格を見る'}
    </a>
  );
}
