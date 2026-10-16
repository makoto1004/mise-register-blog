import Link from 'next/link';
import TagList from '@/components/TagList';
import ComparisonTable from '@/components/ComparisonTable';
import ProductCard from '@/components/ProductCard';
import { getPostSlugs, getPostBySlug } from '@/lib/posts';
import { CATEGORIES } from '@/lib/site';

// ビルド時に生成するページの一覧（Static Export では必須）
export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

// generateStaticParams にない slug は 404 にする
export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return {
    title: post.title,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: 'article' },
  };
}

// 記事詳細ページ
export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const categoryName = CATEGORIES[post.category];
  // 本文側で <!-- products --> の直前に H2 見出しを書いている場合は、比較表などの見出しを 1 段下げる
  const nested = /<\/h2>\s*$/.test(post.beforeHtml);
  const SectionHeading = nested ? 'h3' : 'h2';

  return (
    <article className="article">
      {/* ステマ規制対応：広告を含む記事であることを冒頭で明示する */}
      <p className="pr-notice">
        <span className="pr-label">PR</span>
        本記事にはアフィリエイト広告（Amazonアソシエイト）を含みます。
      </p>
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link>
        {categoryName && (
          <>
            {' › '}
            <Link href={`/category/${post.category}`}>{categoryName}</Link>
          </>
        )}
      </nav>
      <h1>{post.title}</h1>
      <div className="post-meta">
        <time dateTime={post.date}>公開 {post.date}</time>
        {post.updated && <time dateTime={post.updated}>更新 {post.updated}</time>}
        <TagList tags={post.tags} />
      </div>

      <div className="post-body" dangerouslySetInnerHTML={{ __html: post.beforeHtml }} />

      {post.products.length > 0 && (
        <>
          <SectionHeading className="products-heading">比較表</SectionHeading>
          <ComparisonTable products={post.products} />
          <SectionHeading className="products-heading">おすすめ製品の紹介</SectionHeading>
          {post.products.map((product, index) => (
            <ProductCard
              key={product.name}
              product={product}
              rank={index + 1}
              headingLevel={nested ? 'h4' : 'h3'}
            />
          ))}
        </>
      )}

      <div className="post-body" dangerouslySetInnerHTML={{ __html: post.afterHtml }} />

      <p className="price-note">
        ※ 価格・在庫・仕様は変わることがあります。購入前にAmazonの商品ページとメーカー公式サイトで最新情報を確認してください。
      </p>
      <p className="back-link">
        <Link href="/">← 記事一覧に戻る</Link>
      </p>
    </article>
  );
}
