import Link from 'next/link';

// 記事の最後に置く「前の記事・次の記事」のリンク（同じカテゴリーの一覧の並び順）
export default function PostNav({ prev, next }) {
  if (!prev && !next) return null;
  return (
    <nav className="post-nav" aria-label="前の記事・次の記事">
      {prev ? (
        <Link href={`/posts/${prev.slug}`} className="post-nav-link post-nav-prev">
          <span className="post-nav-label">← 前の記事</span>
          <span className="post-nav-title">{prev.title}</span>
        </Link>
      ) : (
        <span className="post-nav-empty" />
      )}
      {next ? (
        <Link href={`/posts/${next.slug}`} className="post-nav-link post-nav-next">
          <span className="post-nav-label">次の記事 →</span>
          <span className="post-nav-title">{next.title}</span>
        </Link>
      ) : (
        <span className="post-nav-empty" />
      )}
    </nav>
  );
}
