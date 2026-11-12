import PostCard from '@/components/PostCard';
import { getAllPosts } from '@/lib/posts';

// slug の並びのとおりに、公開済みの記事だけをカードで並べる（公開前の slug は黙って飛ばす）
export default function JourneyPostList({ slugs }) {
  const bySlug = new Map(getAllPosts().map((post) => [post.slug, post]));
  const posts = slugs.map((slug) => bySlug.get(slug)).filter(Boolean);

  if (posts.length === 0) return null;

  return (
    <ul className="card-grid journey-post-list">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </ul>
  );
}