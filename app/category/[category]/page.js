import Link from 'next/link';
import CategoryTabs from '@/components/CategoryTabs';
import PostSearch from '@/components/PostSearch';
import { getAllPosts, getPostsByCategory, getLatestPosts, toSearchItem } from '@/lib/posts';
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
  const latestSlugs = getLatestPosts().map((post) => post.slug);
  const counts = {};
  for (const post of getAllPosts()) counts[post.category] = (counts[post.category] ?? 0) + 1;

  return (
    <>
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link> › <span>{CATEGORIES[category]}</span>
      </nav>
      <CategoryTabs current={category} counts={counts} />
      <h1 className="page-title">{CATEGORIES[category]}</h1>
      <p className="category-description">{CATEGORY_DESCRIPTIONS[category]}</p>
      {posts.length === 0 ? (
        <p>このカテゴリーの記事はまだありません。</p>
      ) : (
        <PostSearch posts={posts.map(toSearchItem)} categories={CATEGORIES} fixedCategory={category} latestSlugs={latestSlugs} />
      )}
    </>
  );
}
