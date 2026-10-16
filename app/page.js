import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { getPostsByCategory } from '@/lib/posts';
import { CATEGORIES, CATEGORY_DESCRIPTIONS } from '@/lib/site';

// トップページ：業種（カテゴリー）ごとに記事のカードを並べる
export default function Home() {
  return (
    <>
      <h1 className="page-title">業種から探す</h1>
      {Object.entries(CATEGORIES).map(([slug, name], index) => {
        const posts = getPostsByCategory(slug);
        return (
          <section key={slug} className="category-section">
            <div className="section-head">
              <h2>
                <span className="section-number">{String(index + 1).padStart(2, '0')}</span>
                {name}
              </h2>
              <Link href={`/category/${slug}`} className="underline-link more-link">
                すべて見る →
              </Link>
            </div>
            <p className="category-description">{CATEGORY_DESCRIPTIONS[slug]}</p>
            {posts.length === 0 ? (
              <p>記事は準備中です。</p>
            ) : (
              <ul className="card-grid">
                {posts.map((post) => (
                  <PostCard key={post.slug} post={post} showCategory={false} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </>
  );
}
