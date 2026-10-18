import ThemeBackground from '@/components/ThemeBackground';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/site';

// 記事のサムネイル。image があれば画像、なければカテゴリー色の背景に
// 記事のテーマのイラスト（周りに小さく）と、タイトルの要点（中央）を描く
// wide を付けると横長（16:9）用に、背景の絵を多めに描く（トップページの新着記事など）
export default function PostThumbnail({ post, wide = false }) {
  if (post.image) {
    return <img src={post.image} alt="" className="thumb" loading="lazy" />;
  }
  // 「〇〇｜△△」形式のタイトルは「｜」より前を要点として大きく出す
  const headline = post.title.split('｜')[0];
  return (
    <div className={`thumb thumb-text thumb-${post.category}`} aria-hidden="true">
      {wide ? <ThemeBackground post={post} width={480} height={270} dense /> : <ThemeBackground post={post} />}
      <span className="thumb-label">{CATEGORY_LABELS[post.category] ?? ''}</span>
      <span className="thumb-headline">{headline}</span>
      <span className="thumb-category">{CATEGORIES[post.category] ?? ''}</span>
    </div>
  );
}
