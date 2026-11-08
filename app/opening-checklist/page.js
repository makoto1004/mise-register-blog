import Link from 'next/link';
import OpeningChecklist from '@/components/OpeningChecklist';
import { getAllPosts } from '@/lib/posts';
import { OPENING_STAGES } from '@/lib/openingChecklist';
import { SITE } from '@/lib/site';

// 開業準備チェックリストのページ。チェックの状態と開業予定日は、ブラウザの中（localStorage）だけに保存する
export const metadata = {
  title: '開業準備チェックリスト｜お店の形からレジ・開店日まで',
  description:
    '小さなお店の開業準備を、お店の形・お金・レジと決済・開店の準備の4段階、15項目で確かめられるチェックリストです。次にやることと開業予定日までの日数が分かり、関連する記事もすぐ読めます。',
  alternates: { canonical: '/opening-checklist' },
};

export default function OpeningChecklistPage() {
  // 公開されている記事だけをリンクにする（予約中・削除した記事へのリンク切れを作らない）
  const published = new Set(getAllPosts().map((post) => post.slug));
  const stages = OPENING_STAGES.map((stage) => ({
    ...stage,
    items: stage.items.map((item) => ({
      ...item,
      links: item.links.filter((link) => published.has(link.slug)),
    })),
  }));

  return (
    <article className="article">
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link> › <span>開業準備チェックリスト</span>
      </nav>
      <h1 className="page-title checklist-title">開業準備チェックリスト</h1>
      <p className="category-description">
        開業の準備を4つの段階に分けました。終わったものにチェックを入れると、次にやることが1つだけ大きく出ます。関連する記事もそこから読めます。
      </p>
      <OpeningChecklist stages={stages} consultAvailable={Boolean(SITE.consultFormUrl)} />
    </article>
  );
}
