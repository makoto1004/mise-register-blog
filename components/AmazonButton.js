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
      {/* 広告リンクであることを読者に分かるように表示する（PR 表記のルール） */}
      <span className="ad-tag">PR</span>
      {small ? 'Amazonで見る' : 'Amazonで価格を見る'}
    </a>
  );
}
