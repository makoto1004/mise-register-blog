import Link from 'next/link';
import { getAllPosts, getPostsByCategory } from '@/lib/posts';
import { CATEGORIES, PURPOSES } from '@/lib/site';

export const metadata = {
  title: 'サイトマップ',
  description: 'すべての記事を、業種別・目的別に一覧できるページです。',
  alternates: { canonical: '/site-map' },
};

// サイトマップ（人が読むための全記事一覧）。業種別と目的別の 2 つの入り口を用意する
export default function SiteMapPage() {
  const all = getAllPosts();
  const bySlug = new Map(all.map((post) => [post.slug, post]));

  return (
    <article className="site-map">
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link> › <span>サイトマップ</span>
      </nav>
      <h1 className="page-title">サイトマップ</h1>
      <p className="category-description">
        全{all.length}本の記事を、「業種から探す」と「目的から探す」の2つの方法で一覧にしています。
      </p>

      <nav className="jump-links" aria-label="ページ内の移動">
        <a href="#industry">業種から探す</a>
        <a href="#purpose">目的から探す</a>
        <Link href="/about">運営者情報</Link>
      </nav>

      <section id="industry" className="map-section">
        <h2>業種から探す</h2>
        <div className="map-grid">
          {Object.entries(CATEGORIES).map(([slug, name]) => {
            const posts = getPostsByCategory(slug);
            return (
              <section key={slug} className="map-group">
                <h3>
                  <Link href={`/category/${slug}`} className="underline-link">
                    {name}
                  </Link>
                  <span className="map-count">{posts.length}本</span>
                </h3>
                <ul>
                  {posts.map((post) => (
                    <li key={post.slug}>
                      <Link href={`/posts/${post.slug}`}>{post.title.split('｜')[0]}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      <section id="purpose" className="map-section">
        <h2>目的から探す</h2>
        <div className="map-grid">
          {PURPOSES.map((purpose) => {
            const posts = purpose.slugs.map((s) => bySlug.get(s)).filter(Boolean);
            if (posts.length === 0) return null;
            return (
              <section key={purpose.id} className="map-group">
                <h3>
                  {purpose.name}
                  <span className="map-count">{posts.length}本</span>
                </h3>
                <ul>
                  {posts.map((post) => (
                    <li key={post.slug}>
                      <Link href={`/posts/${post.slug}`}>{post.title.split('｜')[0]}</Link>
                      <span className="map-category">{CATEGORIES[post.category]?.replace('向け', '')}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>
    </article>
  );
}
