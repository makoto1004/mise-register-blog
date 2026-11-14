import Link from 'next/link';
import JourneySteps from '@/components/JourneySteps';
import JourneyPostList from '@/components/JourneyPostList';
import { JOURNEY_STEPS } from '@/lib/journey';
import { CATEGORIES } from '@/lib/site';
import { getPostsByCategory } from '@/lib/posts';

const STEP = JOURNEY_STEPS.find((step) => step.id === 'genre');

export const metadata = {
  title: 'ジャンル別の記事（業種・家具・豆知識）',
  description: 'カフェ・美容院・キッチンカー・アパレルなど、開きたいお店の業種ごとの記事と、お店の家具・豆知識の記事を紹介します。',
  alternates: { canonical: '/shop-genre' },
};

// 道のりの 5：最後に記事を紹介する。上から「業種で探す」「家具」「豆知識」
export default function Page() {
  return (
    <>
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link> › <span>{STEP.name}</span>
      </nav>
      <JourneySteps current="genre" />
      <h1 className="page-title">{STEP.name}</h1>
      <p className="category-description">{STEP.lead}</p>

      <section className="genre-section" aria-labelledby="genre-industry">
        <h2 id="genre-industry">業種で探す</h2>
        <div className="journey-post-list">
          <ul>
            {STEP.categories.map((slug) => (
              <li key={slug}>
                <Link href={`/category/${slug}`}>
                  {CATEGORIES[slug]}（{getPostsByCategory(slug).length}本）
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {STEP.sections.map((section) => (
        <section key={section.id} className="genre-section" aria-labelledby={`genre-${section.id}`}>
          <h2 id={`genre-${section.id}`}>{section.title}</h2>
          <JourneyPostList slugs={section.slugs} />
        </section>
      ))}
    </>
  );
}
