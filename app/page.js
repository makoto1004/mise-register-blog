import Link from 'next/link';
import PostThumbnail from '@/components/PostThumbnail';
import JsonLd from '@/components/JsonLd';
import { XFollow } from '@/components/XLinks';
import XTimeline from '@/components/XTimeline';
import XPostEmbeds from '@/components/XPostEmbeds';
import NewBadge from '@/components/NewBadge';
import PostTitle from '@/components/PostTitle';
import AmazonSaleBanner from '@/components/AmazonSaleBanner';
import RakutenSaleBanner from '@/components/RakutenSaleBanner';
import { getPostsByCategory, getLatestPosts } from '@/lib/posts';
import { SITE, CATEGORIES, CATEGORY_DESCRIPTIONS, SERVICES_OPEN } from '@/lib/site';

// トップの見出しに並べる 4 業種の絵（public/images/hero/shop-*.webp）
const HERO_SHOPS = [
  { slug: 'cafe', label: 'カフェ・飲食店' },
  { slug: 'salon', label: '美容院・サロン' },
  { slug: 'kitchen-car', label: 'キッチンカー' },
  { slug: 'apparel', label: 'アパレル・雑貨店' },
];

// 各業種の欄に出す文字の一覧の本数（残りは「すべて見る」のカテゴリーのページで読める）
const HOME_ROW_COUNT = 5;

// トップページ
// 上部：見出しの文字と、押せる 4 業種の絵
// 各業種：見出しを左に固定し、右に最初の 1 本を大きく、続く数本を文字の一覧で並べる
export default function Home() {
  const sections = Object.entries(CATEGORIES).map(([slug, name]) => ({
    slug,
    name,
    posts: getPostsByCategory(slug),
  }));
  const postCounts = Object.fromEntries(sections.map((s) => [s.slug, s.posts.length]));
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
      {/* 見出し部分：文字は画像にせず本文として置き、4 業種の絵はそのままカテゴリーへのリンクにする */}
      <section className="home-hero">
        <div className="home-hero-copy">
          <h1>
            <span className="sr-only">mise &amp; register </span>
            小さなお店の
            <br />
            レジ選びを、
            <br />
            すっきり、納得。
          </h1>
          <p>業種別のPOSレジ・キャッシュレス決済・周辺機器のガイドです。</p>
        </div>
        <nav className="home-shops" aria-label="業種から探す">
          {HERO_SHOPS.map((shop) => (
            <Link key={shop.slug} href={`/category/${shop.slug}`} className="home-shop">
              {/* eslint-disable-next-line @next/next/no-img-element -- Static Export のため next/image の最適化は使わない */}
              <img src={`/images/hero/shop-${shop.slug}.webp`} width="320" height="320" alt="" fetchPriority="high" />
              <span className="home-shop-name">{shop.label}</span>
              <span className="home-shop-count">{postCounts[shop.slug]}本の記事</span>
            </Link>
          ))}
        </nav>
        <p className="home-hero-more">
          ほかの探し方：
          <Link href="/category/industries" className="underline-link">
            いろいろな業種
          </Link>
          <Link href="/category/devices" className="underline-link">
            周辺機器
          </Link>
          <Link href="/site-map#purpose" className="underline-link">
            目的から探す
          </Link>
          <Link href="/search" className="underline-link">
            キーワードで探す
          </Link>
        </p>
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

      {/* 作業代行と AI相談デスクの案内：絵つきのカードを 2 枚並べる（それぞれ受付先があるときだけ） */}
      {(SERVICES_OPEN || SITE.consultFormUrl) && (
        <section className="home-guide" aria-label="作業代行と無料相談のご案内">
          {SERVICES_OPEN && (
            <Link href="/services" className="home-guide-card home-guide-services">
              {/* eslint-disable-next-line @next/next/no-img-element -- Static Export のため next/image の最適化は使わない */}
              <img src="/images/home-services.webp" width="800" height="574" alt="" loading="lazy" />
              <span className="home-guide-body">
                <span className="home-guide-label">運営者の有料サービス</span>
                <span className="home-guide-title">レジまわりの作業代行</span>
                <span className="home-guide-text">商品登録のCSV・スタッフ向けの操作マニュアル・レジの困りごとの整理を、文字のやりとりだけで代わりに作ります。</span>
                <span className="home-guide-button">内容と料金を見る →</span>
              </span>
            </Link>
          )}
          {SITE.consultFormUrl && (
            <Link href="/consult" className="home-guide-card">
              {/* eslint-disable-next-line @next/next/no-img-element -- Static Export のため next/image の最適化は使わない */}
              <img src="/images/home-consult.webp" width="800" height="574" alt="" loading="lazy" />
              <span className="home-guide-body">
                <span className="home-guide-label">AI相談デスク（無料）</span>
                <span className="home-guide-title">レジまわりの困りごと、無料で相談できます</span>
                <span className="home-guide-text">POSレジ・決済端末・プリンター・スキャナー・お店のネットワークのことを、フォームから相談できます。レジまるとポスタが回答の下書きを作り、運営者が確認してからメールでお返しします。</span>
                <span className="home-guide-button">相談してみる →</span>
              </span>
            </Link>
          )}
        </section>
      )}

      {/* Amazon のセールのバナー：セールの期間だけ表示する */}
      <div className="sale-banners">
        <AmazonSaleBanner />
        <RakutenSaleBanner />
      </div>

      {sections.map(({ slug, name, posts }) => {
        const [featured, ...others] = posts;
        const rows = others.slice(0, HOME_ROW_COUNT);
        return (
          <section key={slug} id={`cat-${slug}`} className="home-section home-category">
            <div className="home-category-head">
              <h2>{name}</h2>
              <p className="category-description">{CATEGORY_DESCRIPTIONS[slug]}</p>
              <Link href={`/category/${slug}`} className="home-category-all">
                {posts.length}本すべて見る
              </Link>
            </div>
            <div className="home-category-body">
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
              {rows.length > 0 && (
                <ul className="post-rows">
                  {rows.map((post) => (
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
            </div>
          </section>
        );
      })}

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

      <section className="home-section x-section" aria-label="X・Instagram のお知らせ">
        <div className="section-head">
          <h2>X・Instagram でもお知らせしています</h2>
        </div>
        {/* 選んだ投稿があればそれを埋め込み（最大 3 件）、なければタイムラインを表示する */}
        {SITE.homeXPosts.length > 0 ? <XPostEmbeds urls={SITE.homeXPosts} /> : <XTimeline account={SITE.xAccount} />}
        <XFollow />
      </section>
    </>
  );
}
