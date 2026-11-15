import Link from 'next/link';
import PostThumbnail from '@/components/PostThumbnail';

// 記事の最後に出す「あわせて読みたい記事」（選び方は lib/related.js）
export default function RelatedPosts({ posts }) {
  if (posts.length === 0) return null;
  return (
    <section className="related-posts" aria-labelledby="related-heading">
      <h2 id="related-heading" className="products-heading">
        あわせて読みたい記事
      </h2>
      <ul className="related-list">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`} className="related-card">
              <PostThumbnail post={post} />
              <span className="related-title">{post.title}</span>
              <time dateTime={post.date} className="related-date">
                {post.date}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
