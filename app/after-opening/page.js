import Link from 'next/link';
import JourneySteps from '@/components/JourneySteps';
import JourneyPostList from '@/components/JourneyPostList';
import HelpChoices from '@/components/HelpChoices';
import { JOURNEY_STEPS } from '@/lib/journey';

const STEP = JOURNEY_STEPS.find((step) => step.id === 'after');

export const metadata = {
  title: '開業したあと・作業代行（トラブルの直し方・相談・資料づくり）',
  description: 'レシートが出ない・ドロアが開かないなど、開業後の POS レジのトラブルの直し方と、無料の AI 相談・有料の作業代行（資料づくり）の案内です。お店の家具と豆知識の記事も紹介します。',
  alternates: { canonical: '/after-opening' },
};

// 上から：トラブルの記事 → 困ったら（無料の相談・有料の作業代行）→ 家具 → 豆知識
export default function Page() {
  return (
    <>
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link> › <span>{STEP.name}</span>
      </nav>
      <JourneySteps current="after" />
      <h1 className="page-title">{STEP.name}</h1>
      <p className="category-description">{STEP.lead}</p>
      <JourneyPostList slugs={STEP.slugs} />
      <HelpChoices />
      {STEP.sections.map((section) => (
        <section key={section.id} className="genre-section" aria-labelledby={`after-${section.id}`}>
          <h2 id={`after-${section.id}`}>{section.title}</h2>
          <JourneyPostList slugs={section.slugs} />
        </section>
      ))}
    </>
  );
}
