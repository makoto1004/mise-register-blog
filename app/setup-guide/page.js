import Link from 'next/link';
import JourneySteps from '@/components/JourneySteps';
import JourneyPostList from '@/components/JourneyPostList';
import { OPENING_STAGES } from '@/lib/openingChecklist';
import { JOURNEY_STEPS } from '@/lib/journey';

const STEP = JOURNEY_STEPS.find((step) => step.id === 'setup');

// 開業準備チェックリストの項目の数（案内の帯の文に出す）
const totalItems = OPENING_STAGES.reduce((sum, stage) => sum + stage.items.length, 0);

export const metadata = {
  title: '導入ガイド（設定・ネットワーク・開店前の確認）',
  description: 'POS レジの初期設定、お店のネットワーク、商品登録、開店前の確認など、導入に必要な手順をまとめた記事の一覧です。',
  alternates: { canonical: '/setup-guide' },
};

export default function Page() {
  return (
    <>
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link> › <span>{STEP.name}</span>
      </nav>
      <JourneySteps current="setup" />
      <h1 className="page-title">{STEP.name}</h1>
      <p className="category-description">{STEP.lead}</p>
      {/* 開業準備チェックリストの案内の帯 */}
      <section className="home-checklist" aria-labelledby="home-checklist-heading">
        <div className="home-checklist-copy">
          <h2 id="home-checklist-heading">開業準備チェックリスト</h2>
          <p>
            開業の準備を4つの段階・{totalItems}項目に分けました。チェックを入れると、次にやることが1つずつ分かります。
          </p>
        </div>
        <ol className="home-checklist-stages">
          {OPENING_STAGES.map((stage) => (
            <li key={stage.id}>{stage.name}</li>
          ))}
        </ol>
        <Link href="/opening-checklist" className="home-checklist-button">
          チェックリストを開く
        </Link>
      </section>
      <JourneyPostList slugs={STEP.slugs} />
    </>
  );
}