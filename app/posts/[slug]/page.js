import Link from 'next/link';
import TagList from '@/components/TagList';
import ComparisonTable from '@/components/ComparisonTable';
import ProductCard from '@/components/ProductCard';
import ServiceCard from '@/components/ServiceCard';
import PickCard from '@/components/PickCard';
import ThemeBackground from '@/components/ThemeBackground';
import CostSimulator from '@/components/CostSimulator';
import { getPostSlugs, getPostBySlug } from '@/lib/posts';
import { CATEGORIES, OG_IMAGE } from '@/lib/site';

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
    // openGraph は親（layout）の設定を上書きするので、共有用の画像もここで指定する
    openGraph: { title: post.title, description: post.description, type: 'article', images: [OG_IMAGE] },
  };
}

// 直前の本文が H2 見出しで終わっていれば、差し込むブロックの見出しを 1 段下げる
const endsWithH2 = (section) => section?.type === 'html' && /<\/h2>\s*$/.test(section.html);

function ProductsBlock({ products, nested }) {
  const Heading = nested ? 'h3' : 'h2';
  return (
    <>
      <Heading className="products-heading">比較表</Heading>
      <ComparisonTable products={products} />
      <Heading className="products-heading">おすすめ製品の紹介</Heading>
      {products.map((product, index) => (
        <ProductCard key={product.name} product={product} rank={index + 1} headingLevel={nested ? 'h4' : 'h3'} />
      ))}
    </>
  );
}

function ServicesBlock({ services, nested }) {
  const Heading = nested ? 'h3' : 'h2';
  return (
    <>
      <Heading className="products-heading">おすすめのサービス</Heading>
      <div className="service-grid">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} headingLevel={nested ? 'h4' : 'h3'} />
        ))}
      </div>
      <p className="service-note">※ 料金・機能・キャンペーンは変わることがあります。最新の情報は各サービスの公式サイトで確認してください。</p>
    </>
  );
}

function PicksBlock({ picks, nested }) {
  const Heading = nested ? 'h3' : 'h2';
  const shops = [...new Set(picks.map((p) => p.shop))].join('・');
  return (
    <>
      <Heading className="products-heading">実際の商品の例（{shops}）</Heading>
      <div className="pick-grid">
        {picks.map((pick) => (
          <PickCard key={pick.url} pick={pick} />
        ))}
      </div>
      <p className="service-note">※ 価格・在庫・仕様は変わることがあります。購入前に商品ページで最新の情報を確認してください。</p>
    </>
  );
}

// 記事詳細ページ
export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const categoryName = CATEGORIES[post.category];

  return (
    <article className="article">
      {/* ステマ規制対応：広告を含む記事であることを冒頭で明示する */}
      <p className="pr-notice">
        <span className="pr-label">PR</span>
        本記事にはアフィリエイト広告（Amazonアソシエイト・楽天アフィリエイト・A8.netなど）を含みます。
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
      {/* 記事の見出し部分。背景に記事のテーマのイラストを入れる（中央は文字のために空ける） */}
      <header className={`article-hero thumb-${post.category}`}>
        <ThemeBackground post={post} width={760} height={260} />
        <h1>{post.title}</h1>
        <div className="post-meta">
          <time dateTime={post.date}>公開 {post.date}</time>
          {post.updated && <time dateTime={post.updated}>更新 {post.updated}</time>}
          <TagList tags={post.tags} />
        </div>
      </header>

      {post.sections.map((section, index) => {
        const nested = endsWithH2(post.sections[index - 1]);
        if (section.type === 'products') {
          return <ProductsBlock key={index} products={post.products} nested={nested} />;
        }
        if (section.type === 'services') {
          return <ServicesBlock key={index} services={post.services} nested={nested} />;
        }
        if (section.type === 'picks') {
          return <PicksBlock key={index} picks={post.picks} nested={nested} />;
        }
        return <div key={index} className="post-body" dangerouslySetInnerHTML={{ __html: section.html }} />;
      })}

      <CostSimulator category={post.category} />

      <p className="price-note">
        ※ 価格・在庫・仕様は変わることがあります。購入前に各商品ページ・公式サイトで最新情報を確認してください。
      </p>
      <p className="back-link">
        <Link href="/">← 記事一覧に戻る</Link>
      </p>
    </article>
  );
}
