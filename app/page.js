import Link from 'next/link';
import PostThumbnail from '@/components/PostThumbnail';
import JsonLd from '@/components/JsonLd';
import NewBadge from '@/components/NewBadge';
import PostTitle from '@/components/PostTitle';
import AmazonSaleBanner from '@/components/AmazonSaleBanner';
import RakutenSaleBanner from '@/components/RakutenSaleBanner';
import JourneySteps from '@/components/JourneySteps';
import HelpChoices from '@/components/HelpChoices';
import { getLatestPosts } from '@/lib/posts';
import { SITE, CATEGORIES } from '@/lib/site';

// トップページ
// 上から：見出しと説明、開業準備の道のり（1→4）、困ったときの相談先、新着記事、Excel テンプレート、セールのバナー、運営者の帯
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
      {/* 見出し部分：文字は画像にせず本文として置く。POS レジの絵は飾り（リンクにしない） */}
      <section className="home-hero">
        <div className="home-hero-copy">
          <h1>
            <span className="sr-only">mise &amp; register </span>
            開業前に、POS レジと周辺機器を『つながる組み合わせ』で選ぶ
          </h1>
          <p>開業準備の順番に、読む記事を並べました。</p>
        </div>
        <div className="home-pos">
          {/* eslint-disable-next-line @next/next/no-img-element -- Static Export のため next/image の最適化は使わない */}
          <img src="/images/hero/pos-register.webp" width="800" height="800" alt="" fetchPriority="high" />
        </div>
      </section>

      <JourneySteps />

      <HelpChoices />
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

      {/* Excel テンプレートの案内（BOOTH で販売） */}
      <section className="home-guide" aria-label="Excel テンプレートのご案内">
        <Link href="/templates" className="home-guide-card">
          {/* eslint-disable-next-line @next/next/no-img-element -- Static Export のため next/image の最適化は使わない */}
          <img src="/images/home-templates.webp" width="800" height="574" alt="" loading="lazy" />
          <span className="home-guide-body">
            <span className="home-guide-label">運営者の Excel テンプレート（BOOTH で販売）</span>
            <span className="home-guide-title">お店の IT 管理台帳・売上集計シート</span>
            <span className="home-guide-text">機器と保証期限・障害記録・点検表をまとめる台帳と、POSレジの売上明細を貼るだけで集計するシート。マクロなしの数式だけで動きます。</span>
            <span className="home-guide-button">中身と使い方を見る →</span>
          </span>
        </Link>
      </section>

      {/* Amazon のセールのバナー：セールの期間だけ表示する */}
      <div className="sale-banners">
        <AmazonSaleBanner />
        <RakutenSaleBanner />
      </div>

      {/* 運営者の案内：横長の帯（絵とプロフィールへのボタン） */}
      <section className="home-consult" aria-labelledby="about-heading">
        {/* eslint-disable-next-line @next/next/no-img-element -- Static Export のため next/image の最適化は使わない */}
        <img className="home-consult-photo" src="/images/home-about.webp" width="800" height="574" alt="" loading="lazy" />
        <div className="home-consult-body">
          <p className="home-consult-label">運営者について</p>
          <h2 id="about-heading">相談デスクの店番です</h2>
          <p>POSレジ・周辺機器のヘルプデスクの仕事をしている運営者が、お店の目線でレジ選びをまとめています。</p>
          <Link href="/about#profile" className="home-consult-button">
            プロフィールを見る →
          </Link>
        </div>
      </section>
    </>
  );
}
