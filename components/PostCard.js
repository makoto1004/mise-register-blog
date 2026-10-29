import Link from 'next/link';
import PostThumbnail from '@/components/PostThumbnail';
import NewBadge from '@/components/NewBadge';
import PostTitle from '@/components/PostTitle';
import { CATEGORIES } from '@/lib/site';

// 記事一覧に並べる 1 記事分のカード（サムネイル・タイトル・日付）
// カテゴリー別に並べる画面では showCategory={false} にする。isLatest が true なら NEW の印を付ける（公開から 7 日以内のとき）
export default function PostCard({ post, showCategory = true, isLatest = false }) {
  return (
    <li className="post-card">
      <Link href={`/posts/${post.slug}`} className="thumb-link" tabIndex={-1}>
        <PostThumbnail post={post} />
      </Link>
      <Link href={`/posts/${post.slug}`} className="card-title">
        <PostTitle title={post.title} />
      </Link>
      <div className="card-meta">
        {isLatest && <NewBadge date={post.date} />}
        <time dateTime={post.date}>{post.date.replaceAll('-', '/')}</time>
        {showCategory && CATEGORIES[post.category] && (
          <Link href={`/category/${post.category}`} className="underline-link">
            {CATEGORIES[post.category]}
          </Link>
        )}
      </div>
    </li>
  );
}
