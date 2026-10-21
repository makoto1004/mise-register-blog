import Link from 'next/link';
import PostThumbnail from '@/components/PostThumbnail';
import JsonLd from '@/components/JsonLd';
import { XFollow } from '@/components/XLinks';
import XTimeline from '@/components/XTimeline';
import XPostEmbeds from '@/components/XPostEmbeds';
import NewBadge from '@/components/NewBadge';
import { getPostsByCategory, getLatestPosts } from '@/lib/posts';
import { SITE, CATEGORIES, CATEGORY_DESCRIPTIONS } from '@/lib/site';

// トップページ
// 上部：Canva でデザインした見出しの画像。その下に業種へのジャンプ
// 各業種：最初の 1 本だけ大きく見せ、残りは文字の一覧（同じ形のカードを並べ続けない）
export default function Home() {
  const sections = Object.entries(CATEGORIES).map(([slug, name]) => ({
    slug,
    name,
    posts: getPostsByCategory(slug),
  }));
  const latest = getLatestPosts();
  // NEW の印は、新着の 3 本（かつ公開から 7 日以内）だけに付ける
  const latestSlugs = new Set(latest.map((post) => post.slug));

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
      {/* 見出し部分：Canva でデザインした画像（public/images/hero/）。見出しの文字は画像の中にあるので、h1 は画面に出さずに読み上げ・検索用に置く */}
      <section className="home-hero">
        <h1 className="sr-only">小さなお店のレジ選びを、すっきり、納得。mise &amp; register</h1>
        <picture>
          <source type="image/webp" srcSet="/images/hero/home-hero-800.webp 800w, /images/hero/home-hero-1600.webp 1600w" sizes="(max-width: 1100px) 100vw, 1100px" />
          {/* eslint-disable-next-line @next/next/no-img-element -- Static Export のため next/image の最適化は使わない */}
          <img
            src="/images/hero/home-hero-1600.jpg"
            width="1600"
            height="900"
            alt="mise & register。小さなお店のレジ選びを、すっきり、納得。業種別のPOSレジ・キャッシュレス決済・周辺機器ガイド。カフェ・美容院・キッチンカー・アパレル。"
            className="home-hero-image"
            fetchPriority="high"
          />
        </picture>
      </section>

      <nav className="jump-links home-jump" aria-label="業種から探す">
          {sections.map((s) => (
            <a key={s.slug} href={`#cat-${s.slug}`}>
              {s.name.replace('向け', '').replace('（共通）', '')}
            </a>
          ))}
          <Link href="/site-map#purpose">目的から探す →</Link>
      </nav>

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
                  <span className="latest-title">{post.title}</span>
                  <time dateTime={post.date} className="latest-date">
                    {post.date.replaceAll('-', '/')}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sections.map(({ slug, name, posts }) => {
        const [featured, ...rest] = posts;
        return (
          <section key={slug} id={`cat-${slug}`} className="home-section">
            <div className="section-head">
              <h2>{name}</h2>
              <Link href={`/category/${slug}`} className="underline-link more-link">
                すべて見る（{posts.length}本）
              </Link>
            </div>
            <p className="category-description">{CATEGORY_DESCRIPTIONS[slug]}</p>

            {featured && (
              <Link href={`/posts/${featured.slug}`} className="featured-post">
                <span className="featured-thumb">
                  <PostThumbnail post={featured} />
                </span>
                <span className="featured-body">
                  <span className="featured-label">
                    まず読みたい記事
                    {latestSlugs.has(featured.slug) && <NewBadge date={featured.date} />}
                  </span>
                  <span className="featured-title">{featured.title}</span>
                  {featured.description && <span className="featured-desc">{featured.description}</span>}
                </span>
              </Link>
            )}

            {rest.length > 0 && (
              <ul className="post-rows">
                {rest.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/posts/${post.slug}`} className="post-row">
                      <span className="post-row-title">
                        {latestSlugs.has(post.slug) && <NewBadge date={post.date} />}
                        {post.title}
                      </span>
                      <time dateTime={post.date} className="post-row-date">
                        {post.date.replaceAll('-', '/')}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <section className="home-section x-section" aria-label="X のお知らせ">
        <div className="section-head">
          <h2>X でもお知らせしています</h2>
        </div>
        {/* 選んだ投稿があればそれを埋め込み（最大 3 件）、なければタイムラインを表示する */}
        {SITE.homeXPosts.length > 0 ? <XPostEmbeds urls={SITE.homeXPosts} /> : <XTimeline account={SITE.xAccount} />}
        <XFollow />
      </section>
    </>
  );
}
