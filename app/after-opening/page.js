import Link from 'next/link';
import JourneySteps from '@/components/JourneySteps';
import JourneyPostList from '@/components/JourneyPostList';
import HelpChoices from '@/components/HelpChoices';
import { JOURNEY_STEPS } from '@/lib/journey';

const STEP = JOURNEY_STEPS.find((step) => step.id === 'after');

export const metadata = {
  title: '開業したあと・作業代行（トラブルの直し方・相談・資料づくり）',
  description: 'レシートが出ない・ドロアが開かないなど、開業後の POS レジのトラブルの直し方と、無料の AI 相談・有料の作業代行（資料づくり）の案内です。',
  alternates: { canonical: '/after-opening' },
};

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
    </>
  );
}