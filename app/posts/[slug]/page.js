import Link from 'next/link';
import TagList from '@/components/TagList';
import ComparisonTable from '@/components/ComparisonTable';
import ProductCard from '@/components/ProductCard';
import ServiceCard from '@/components/ServiceCard';
import PickCard from '@/components/PickCard';
import VideoCard from '@/components/VideoCard';
import ThemeBackground from '@/components/ThemeBackground';
import CostSimulator from '@/components/CostSimulator';
import QuickSurvey from '@/components/QuickSurvey';
import { XFollow, XShare } from '@/components/XLinks';
import XPostEmbeds from '@/components/XPostEmbeds';
import { getPostSlugs, getPostBySlug } from '@/lib/posts';
import JsonLd from '@/components/JsonLd';
import { SITE, CATEGORIES, OG_IMAGE } from '@/lib/site';

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
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      ...(post.updated ? { modifiedTime: post.updated } : {}),
      images: [OG_IMAGE],
    },
    alternates: { canonical: `/posts/${slug}` },
  };
}

// 記事の構造化データ（記事の情報 + パンくずリスト）
function articleJsonLd(post, categoryName) {
  const url = `${SITE.url}/posts/${post.slug}`;
  const publisher = { '@type': 'Organization', name: SITE.name, url: SITE.url };
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      image: [`${SITE.url}${OG_IMAGE.url}`],
      author: publisher,
      publisher,
      mainEntityOfPage: url,
      inLanguage: 'ja',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${SITE.url}/` },
        ...(categoryName
          ? [{ '@type': 'ListItem', position: 2, name: categoryName, item: `${SITE.url}/category/${post.category}` }]
          : []),
        { '@type': 'ListItem', position: categoryName ? 3 : 2, name: post.title, item: url },
      ],
    },
  ];
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

function VideosBlock({ videos, nested }) {
  const Heading = nested ? 'h3' : 'h2';
  return (
    <>
      <Heading className="products-heading">参考になる動画</Heading>
      <div className="video-grid">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      <p className="service-note">
        ※ 動画の内容は各チャンネルの発信です。許可・基準などの制度については、保健所などの公式情報で確認してください。
      </p>
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
      <JsonLd data={articleJsonLd(post, categoryName)} />
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
      {/* 記事の見出し部分。背景に記事の挿絵（なければテーマのアイコン）を入れる */}
      <header className={`article-hero thumb-${post.category}${post.illustration ? ' has-photo' : ''}`}>
        {post.illustration ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- Static Export のため next/image の最適化は使わない */}
            <img src={post.illustration} alt="" className="theme-photo" />
            <span className="photo-veil" />
          </>
        ) : (
          <ThemeBackground post={post} width={760} height={260} />
        )}
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
        if (section.type === 'videos') {
          return <VideosBlock key={index} videos={post.videos} nested={nested} />;
        }
        return <div key={index} className="post-body" dangerouslySetInnerHTML={{ __html: section.html }} />;
      })}

      <CostSimulator category={post.category} />

      {/* フロントマターの xPosts で選んだ投稿だけを埋め込む（最大 3 件） */}
      {post.xPosts.length > 0 && (
        <section className="x-embed-section" aria-label="関連する X の投稿">
          <h2 className="products-heading">関連する X の投稿</h2>
          <XPostEmbeds urls={post.xPosts} />
        </section>
      )}

      <section className="x-section" aria-label="X でシェア・フォロー">
        <XShare title={post.title} path={`/posts/${post.slug}`} />
        <XFollow lead="記事の更新は X でもお知らせしています。" />
      </section>

      <QuickSurvey slug={post.slug} />

      <div className="feedback-box">
        <p>
          この記事へのご意見・ご質問、取り上げてほしいテーマは、
          <Link href="/contact" className="underline-link">
            お問い合わせ・ご意見フォーム
          </Link>
          からお送りください。
        </p>
      </div>

      <p className="price-note">
        ※ 価格・在庫・仕様は変わることがあります。購入前に各商品ページ・公式サイトで最新情報を確認してください。
      </p>
      <p className="back-link">
        <Link href="/">← 記事一覧に戻る</Link>
      </p>
    </article>
  );
}
