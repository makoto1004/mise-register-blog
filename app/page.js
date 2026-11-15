import Link from 'next/link';
import PostThumbnail from '@/components/PostThumbnail';
import JsonLd from '@/components/JsonLd';
import NewBadge from '@/components/NewBadge';
import PostTitle from '@/components/PostTitle';
import JourneySteps from '@/components/JourneySteps';
import { getLatestPosts } from '@/lib/posts';
import { SITE, CATEGORIES, CONSULT_FREE_NOTE, CONSULT_NAME, CONSULT_AVAILABLE } from '@/lib/site';

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
        {/* 誰のためのサイトか（2026-11-15 に追加） */}
        <p className="home-hero-lead">初めて POS レジを入れる、開業準備中の人のためのブログです。</p>
      </section>

      <JourneySteps large />

      {/* 強み：運営者の経験（about のページと同じ事実だけを書く） */}
      <p className="home-strength">
        運営者は POS レジ・周辺機器の検証と、ヘルプデスクの経験者です。
        <br />
        プリンターやドロアのつなぎ方まで確かめて書いています。
      </p>

      {/* 記事を探す入力欄（JavaScript がなくても /search に言葉を渡せる、ふつうのフォーム） */}
      <form className="home-search" action="/search" method="get" role="search">
        <label htmlFor="home-search-input" className="home-search-label">
          記事を探す
        </label>
        <div className="home-search-row">
          <input id="home-search-input" type="search" name="q" className="search-input" placeholder="例：レシートプリンター" autoComplete="off" enterKeyHint="search" />
          <button type="submit" className="home-search-button">
            探す
          </button>
        </div>
      </form>

      {/* AI無料POSレジ診断の案内。受付を始めるまでは出さない（「準備中」の文も行き止まりになるため） */}
      {CONSULT_AVAILABLE && (
        <section className="help-box help-free home-help" aria-labelledby="home-help-heading">
          <h2 id="home-help-heading" className="help-heading">
            {CONSULT_NAME}
          </h2>
          <p className="help-note">{CONSULT_FREE_NOTE}</p>
          <Link href="/consult" className="help-button">
            診断してみる
          </Link>
        </section>
      )}
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
