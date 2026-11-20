import Link from 'next/link';
import PostThumbnail from '@/components/PostThumbnail';
import JsonLd from '@/components/JsonLd';
import NewBadge from '@/components/NewBadge';
import PostTitle from '@/components/PostTitle';
import JourneySteps from '@/components/JourneySteps';
import { getAllPosts, getLatestPosts } from '@/lib/posts';
import { RANKING, RANKING_COUNT } from '@/lib/ranking';
import { SITE, CATEGORIES, CONSULT_FREE_NOTE, CONSULT_NAME, CONSULT_TAGLINE, CONSULT_AVAILABLE } from '@/lib/site';

// トップページ
// 上から：見出しと道のり（1→4）、無料相談の案内、注目の記事（人気 No.1・最新・今のおすすめ）、よく読まれている記事（2位〜）
export default function Home() {
  // 公開済みの記事だけを使う（予約中・削除した記事は飛ばす）
  const postsBySlug = new Map(getAllPosts().map((post) => [post.slug, post]));
  const ranked = RANKING.slugs.map((slug, i) => ({ post: postsBySlug.get(slug), rank: i + 1 })).filter((r) => r.post);
  const newest = getLatestPosts(10);

  // 上の 3 枠：人気 No.1・最新・今のおすすめ（2026-11-20 運営者が決定）。同じ記事は2回出さない
  // 空きが出たら（ランキングやおすすめがないとき）新しい順の記事で埋める
  const used = new Set();
  const cards = [];
  const addCard = (post, label, kind) => {
    if (!post || used.has(post.slug) || cards.length >= 3) return;
    used.add(post.slug);
    cards.push({ post, label, kind });
  };
  addCard(ranked[0]?.post, '人気 No.1', 'popular');
  addCard(newest.find((p) => !used.has(p.slug)), '最新', 'newest');
  addCard(postsBySlug.get(RANKING.pick), '今のおすすめ', 'pick');
  newest.forEach((p) => addCard(p, '新着', 'newest'));

  // 下の一覧：上の枠に出ていない記事を、ランキングの順位のまま（2位〜）
  const ranking = ranked.filter((r) => !used.has(r.post.slug)).slice(0, RANKING_COUNT - 1);
  // '2026-11-20' → '11/20'
  const [, rankMonth, rankDay] = RANKING.updatedAt.split('-');
  const rankingDate = rankMonth && rankDay ? `${Number(rankMonth)}/${Number(rankDay)}` : '';

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
          <span className="home-hero-key">「つながる組み合わせ」</span>で選ぶ
        </h1>
        {/* 誰のためのサイトか（2026-11-15 に追加） */}
        <p className="home-hero-lead">初めて POS レジを入れる、開業準備中の人のためのブログです。</p>
      </section>

      <JourneySteps large />

      {/* 強み：運営者の経験（about のページと同じ事実だけを書く） */}
      <p className="home-strength">
        運営者は POS レジ・周辺機器の検証と、ヘルプデスクの経験者です。
        <br />
        <span className="marker">プリンターやドロアのつなぎ方まで確かめて</span>書いています。
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
          <p className="consult-tagline"><span className="marker">{CONSULT_TAGLINE}</span></p>
          <p className="help-note">{CONSULT_FREE_NOTE}</p>
          <Link href="/consult" className="help-button">
            診断してみる
          </Link>
        </section>
      )}
      {/* 上の 3 枠：人気 No.1・最新・今のおすすめ */}
      {cards.length > 0 && (
        <section className="home-section latest-section" aria-labelledby="latest-heading">
          <div className="section-head">
            <h2 id="latest-heading">注目の記事</h2>
          </div>
          <ul className="latest-grid">
            {cards.map(({ post, label, kind }, index) => (
              <li key={post.slug} className={index === 0 ? 'latest-card latest-card-top' : 'latest-card'}>
                <Link href={`/posts/${post.slug}`} className="latest-link">
                  {/* 枠の役割の札（人気 No.1・最新・今のおすすめ）。カードの上の縁に大きく出す（2026-11-20 運営者の希望） */}
                  <span className={`latest-ribbon latest-ribbon-${kind}`}>{label}</span>
                  <span className="latest-thumb">
                    <PostThumbnail post={post} wide />
                  </span>
                  <span className="latest-meta">
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
      {/* よく読まれている記事（lib/ranking.js）。上の枠に出ていない分を、順位のまま 2 本以上あるときだけ出す */}
      {ranking.length >= 2 && (
        <section className="home-section ranking-section" aria-labelledby="ranking-heading">
          <div className="section-head">
            <h2 id="ranking-heading">よく読まれている記事</h2>
            <p className="ranking-note">
              {RANKING.periodLabel}
              {rankingDate && `・${rankingDate} 時点`}
            </p>
          </div>
          <ol className="ranking-list">
            {ranking.map(({ post, rank }) => (
              <li key={post.slug} className="ranking-item" value={rank}>
                <Link href={`/posts/${post.slug}`} className="ranking-link">
                  <span className="ranking-rank" aria-hidden="true">{rank}</span>
                  <span className="ranking-title">
                    <PostTitle title={post.title} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
