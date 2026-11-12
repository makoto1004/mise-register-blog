import Link from 'next/link';
import JourneySteps from '@/components/JourneySteps';
import JourneyPostList from '@/components/JourneyPostList';
import PosDiagnosis from '@/components/PosDiagnosis';
import { JOURNEY_STEPS } from '@/lib/journey';
import { getAllPosts } from '@/lib/posts';
import { CATEGORIES } from '@/lib/site';

const STEP = JOURNEY_STEPS.find((step) => step.id === 'find');
// 業種から探すリンクに使うカテゴリー（JavaScript がなくても使える通常のリンク）
const INDUSTRY_SLUGS = ['cafe', 'salon', 'kitchen-car', 'apparel', 'industries'];

export const metadata = {
  title: 'POS レジを探す（お店に合う選び方）',
  description: 'お店の種類・会計の流れ・予算の3つの質問に答えると、合う POS レジの記事・周辺機器・つなぎ方の注意が見つかります。',
  alternates: { canonical: '/find' },
};

export default function Page() {
  // クライアント側では fs を使えないので、公開済みの記事の slug と title だけを渡す
  const posts = getAllPosts().map((post) => ({ slug: post.slug, title: post.title }));

  return (
    <>
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link> › <span>{STEP.name}</span>
      </nav>
      <JourneySteps current="find" />
      <h1 className="page-title">POS レジを探す</h1>
      <p className="category-description">{STEP.lead}</p>
      <PosDiagnosis posts={posts} />
      <section className="find-industries" aria-labelledby="find-industries-heading">
        <h2 id="find-industries-heading" className="find-industries-title">業種から探す</h2>
        <ul>
          {INDUSTRY_SLUGS.map((slug) => (
            <li key={slug}>
              <Link href={`/category/${slug}`}>{CATEGORIES[slug]}</Link>
            </li>
          ))}
        </ul>
      </section>
      <JourneyPostList slugs={STEP.slugs} />
    </>
  );
}
