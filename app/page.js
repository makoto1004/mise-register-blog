import Link from 'next/link';
import PostThumbnail from '@/components/PostThumbnail';
import JsonLd from '@/components/JsonLd';
import NewBadge from '@/components/NewBadge';
import PostTitle from '@/components/PostTitle';
import JourneySteps from '@/components/JourneySteps';
import { getLatestPosts } from '@/lib/posts';
import { SITE, CATEGORIES, CONSULT_FREE_NOTE } from '@/lib/site';

// トップページ
// 上から：見出しと道のり（1→4）、無料相談の案内、新着記事
export default function Home() {
  const latest = getLatestPosts();

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE.name,
          url: `${SITE.url}/`,
          description: SITE.description,
          inLanguage: 'ja',
        }}
      />
      {/* 見出し：文字は画像にせず本文として置く */}
      <section className="home-hero">
        <h1>
          <span className="sr-only">mise &amp; register </span>
          開業前に、POS レジと周辺機器を
          <br />
          「つながる組み合わせ」で選ぶ
        </h1>
      </section>

      <JourneySteps />

      {/* 無料相談の小さな案内（受付先が未設定のときは「準備中」と出す） */}
      <section className="help-box help-free home-help" aria-labelledby="home-help-heading">
        <h2 id="home-help-heading" className="help-heading">
          困ったら無料で相談
        </h2>
        <p className="help-note">{CONSULT_FREE_NOTE}</p>
        {SITE.consultFormUrl ? (
          <Link href="/consult" className="help-button">
            相談してみる
          </Link>
        ) : (
          <p className="help-pending">受付の準備中です</p>
        )}
      </section>
      {/* 新着記事：全カテゴリーから新しい順に 3 本を目立たせて表示する */}
      {latest.length > 0 && (
        <section className="home-section latest-section" aria-labelledby="latest-heading">
          <div className="section-head">
            <h2 id="latest-heading">新着記事</h2>
          </div>
          <ul className="latest-grid">
            {latest.map((post, index) => (
              <li key={post.slug} className={index === 0 ? 'latest-card latest-card-top' : 'latest-card'}>
                <Link href={`/posts/${post.slug}`} className="latest-link">
                  <span className="latest-thumb">
                    <PostThumbnail post={post} wide />
                  </span>
                  <span className="latest-meta">
                    <span className="latest-label">{index === 0 ? '最新' : '新着'}</span>
                    <NewBadge date={post.date} />
                    {CATEGORIES[post.category] && <span className="latest-category">{CATEGORIES[post.category]}</span>}
                  </span>
                  <span className="latest-title">
                    <PostTitle title={post.title} />
                  </span>
                  <time dateTime={post.date} className="latest-date">
                    {post.date.replaceAll('-', '/')}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
