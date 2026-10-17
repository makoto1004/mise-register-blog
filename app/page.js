import Link from 'next/link';
import PostThumbnail from '@/components/PostThumbnail';
import StoreScenes from '@/components/StoreScenes';
import JsonLd from '@/components/JsonLd';
import { XFollow } from '@/components/XLinks';
import { getPostsByCategory } from '@/lib/posts';
import { SITE, CATEGORIES, CATEGORY_DESCRIPTIONS } from '@/lib/site';

// トップページ
// 上部：4 業種の線画を背景にした見出しと、業種へのジャンプ
// 各業種：最初の 1 本だけ大きく見せ、残りは文字の一覧（同じ形のカードを並べ続けない）
export default function Home() {
  const sections = Object.entries(CATEGORIES).map(([slug, name]) => ({
    slug,
    name,
    posts: getPostsByCategory(slug),
  }));

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
      <section className="home-hero">
        <StoreScenes />
        {/* 見出しのデザインは Gemini の提案（雑誌の特集タイトル風）をもとにしている */}
        <p className="home-kicker-en">For small shops</p>
        <h1 className="home-title">
          <span className="home-title-sub">小さなお店のレジ選びを、</span>
          <span className="home-title-main">
            すっきり、<span className="home-title-accent">納得！</span>
          </span>
        </h1>
        <p className="home-lead">{SITE.description}</p>
      </section>

      <nav className="jump-links home-jump" aria-label="業種から探す">
          {sections.map((s) => (
            <a key={s.slug} href={`#cat-${s.slug}`}>
              {s.name.replace('向け', '').replace('（共通）', '')}
            </a>
          ))}
          <Link href="/site-map#purpose">目的から探す →</Link>
      </nav>

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
                  <span className="featured-label">まず読みたい記事</span>
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
                      <span className="post-row-title">{post.title}</span>
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
        <XFollow />
      </section>
    </>
  );
}
