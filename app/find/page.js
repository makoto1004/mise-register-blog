import Link from 'next/link';
import MinchoScope from '@/components/MinchoScope';
import JourneySteps from '@/components/JourneySteps';
import JourneyPostList from '@/components/JourneyPostList';
import PosDiagnosis from '@/components/PosDiagnosis';
import { JOURNEY_STEPS } from '@/lib/journey';
import { getAllPosts } from '@/lib/posts';
import { OWN_TEMPLATES } from '@/lib/ownTemplates';

const STEP = JOURNEY_STEPS.find((step) => step.id === 'find');

export const metadata = {
  title: 'POS レジの選び方（3つの質問でお店に合うレジを探す）',
  description: 'お店の種類・会計の流れ・予算の3つの質問に答えると、合う POS レジの記事・周辺機器・つなぎ方の注意が見つかります。',
  alternates: { canonical: '/find' },
};

// 業種別の入口は、入口が多すぎないように置かない（2026-11-15 に運営者が決めた。業種のカテゴリーはフッターから行ける）
export default function Page() {
  // クライアント側では fs を使えないので、公開済みの記事の slug と title だけを渡す
  const posts = getAllPosts().map((post) => ({ slug: post.slug, title: post.title }));

  const worksheet = OWN_TEMPLATES.pos && { name: OWN_TEMPLATES.pos.name, price: OWN_TEMPLATES.pos.price };

  return (
    <MinchoScope>
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link> › <span>{STEP.name}</span>
      </nav>
      <JourneySteps current="find" />
      <h1 className="page-title">{STEP.name}</h1>
      <p className="category-description">{STEP.lead}</p>
      <PosDiagnosis posts={posts} worksheet={worksheet} />
      <JourneyPostList slugs={STEP.slugs} />
    </MinchoScope>
  );
}
