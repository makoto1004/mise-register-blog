import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { getPostsByCategory } from '@/lib/posts';
import { CATEGORIES, CATEGORY_DESCRIPTIONS } from '@/lib/site';

// カテゴリー別の記事一覧。slug は ASCII にして静的ホスティングでの文字化けを避ける
export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({ category }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { category } = await params;
  return {
    title: `${CATEGORIES[category]}の記事一覧`,
    description: CATEGORY_DESCRIPTIONS[category],
    alternates: { canonical: `/category/${category}` },
  };
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const posts = getPostsByCategory(category);

  return (
    <>
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link> › <span>{CATEGORIES[category]}</span>
      </nav>
      <h1 className="page-title">{CATEGORIES[category]}</h1>
      <p className="category-description">{CATEGORY_DESCRIPTIONS[category]}</p>
      {posts.length === 0 && <p>このカテゴリーの記事はまだありません。</p>}
      <ul className="card-grid">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} showCategory={false} />
        ))}
      </ul>
    </>
  );
}
