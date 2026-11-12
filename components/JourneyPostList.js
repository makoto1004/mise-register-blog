import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

// 最初に見せる記事の数。残りは「もっと見る」（details）で開く（JavaScript がなくても全部読める）
const FIRST_COUNT = 6;

// slug の並びのとおりに、公開済みの記事だけをタイトルの一覧で並べる（公開前の slug は黙って飛ばす）
export default function JourneyPostList({ slugs }) {
  const bySlug = new Map(getAllPosts().map((post) => [post.slug, post]));
  const posts = slugs.map((slug) => bySlug.get(slug)).filter(Boolean);

  if (posts.length === 0) return null;

  const renderItem = (post) => (
    <li key={post.slug}>
      <Link href={`/posts/${post.slug}`}>
        {post.title}
      </Link>
    </li>
  );

  return (
    <div className="journey-post-list">
      <ul>{posts.slice(0, FIRST_COUNT).map(renderItem)}</ul>
      {posts.length > FIRST_COUNT && (
        <details className="journey-more">
          <summary>もっと見る（あと{posts.length - FIRST_COUNT}本）</summary>
          <ul>{posts.slice(FIRST_COUNT).map(renderItem)}</ul>
        </details>
      )}
    </div>
  );
}