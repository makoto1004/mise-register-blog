import Link from 'next/link';
import PostSearch from '@/components/PostSearch';
import { getAllPosts, toSearchItem } from '@/lib/posts';
import { CATEGORIES } from '@/lib/site';

// 記事を言葉とカテゴリーで探すページ。検索はブラウザの中で行う（URL の ?q= と ?cat= で条件を共有できる）
export const metadata = {
  title: '記事を探す',
  description: 'mise & register の記事を、言葉とカテゴリー（カフェ・美容院・キッチンカー・アパレル・周辺機器）で探せます。',
  alternates: { canonical: '/search' },
};

export default function SearchPage() {
  const posts = getAllPosts().map(toSearchItem);

  return (
    <>
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link> › <span>記事を探す</span>
      </nav>
      <h1 className="page-title">記事を探す</h1>
      <PostSearch posts={posts} categories={CATEGORIES} />
    </>
  );
}

