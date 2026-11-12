import Link from 'next/link';
import JourneySteps from '@/components/JourneySteps';
import JourneyPostList from '@/components/JourneyPostList';
import { JOURNEY_STEPS } from '@/lib/journey';

const STEP = JOURNEY_STEPS.find((step) => step.id === 'devices');

export const metadata = {
  title: '周辺機器をそろえる（プリンター・ドロア・スキャナーの相性）',
  description: 'POS レジにつなぐレシートプリンター・キャッシュドロア・バーコードスキャナーなどの選び方と、機器どうしの相性をまとめた記事の一覧です。',
  alternates: { canonical: '/devices-guide' },
};

export default function Page() {
  return (
    <>
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link> › <span>{STEP.name}</span>
      </nav>
      <JourneySteps current="devices" />
      <h1 className="page-title">{STEP.name}</h1>
      <p className="category-description">{STEP.lead}</p>
      <JourneyPostList slugs={STEP.slugs} />
    </>
  );
}