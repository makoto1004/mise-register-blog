'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import PostCard from '@/components/PostCard';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// 記事を言葉とカテゴリーでしぼり込む検索（ブラウザの中だけで動く。サーバーは使わない）
// fixedCategory を渡すとそのカテゴリーの中だけを探し、カテゴリーのボタンは出さない（カテゴリーのページ用）
// 言葉とカテゴリーは URL の ?q= と ?cat= に入れるので、検索結果のページをそのまま共有できる

// 全角・半角、大文字・小文字、カタカナ・ひらがなのちがいを気にせず探せるようにそろえる
function normalize(text) {
  return String(text)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

// ボタン用の短いカテゴリー名（「カフェ・飲食店向け」→「カフェ・飲食店」）
const shortName = (name) => name.replace(/向け$/, '').replace(/（共通）$/, '');

export default function PostSearch({ posts, categories, fixedCategory = '', latestSlugs = [] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(fixedCategory);
  // URL の条件を読み込むまでは、URL を書きかえない（読む前に消してしまわないように）
  const [ready, setReady] = useState(false);
  const latest = useMemo(() => new Set(latestSlugs), [latestSlugs]);

  // URL に検索の条件があれば、最初に読み込む
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get('q') ?? '');
    if (!fixedCategory && categories[params.get('cat')]) setCategory(params.get('cat'));
    setReady(true);
  }, [fixedCategory, categories]);

  // 条件が変わったら URL を書きかえる（履歴は増やさない）
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category && !fixedCategory) params.set('cat', category);
    const search = params.toString();
    window.history.replaceState(null, '', search ? `?${search}` : window.location.pathname);
  }, [ready, query, category, fixedCategory]);

  const indexed = useMemo(
    () => posts.map((post) => ({ post, text: normalize([post.title, post.description, ...post.tags, categories[post.category] ?? ''].join(' ')) })),
    [posts, categories],
  );
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const inCategory = indexed.filter(({ post }) => !category || post.category === category);
  const results = inCategory.filter(({ text }) => terms.every((t) => text.includes(t))).map(({ post }) => post);

  const counts = useMemo(() => {
    const c = {};
    for (const { post } of indexed) c[post.category] = (c[post.category] ?? 0) + 1;
    return c;
  }, [indexed]);

  // カードの動き（GSAP）。画面の下のカードはスクロールで見えたときにふわっと出す
  // 言葉やカテゴリーを変えたときは、見えているカードも順番に出して「結果が変わった」と分かるようにする
  // 最初に開いたときに見えているカードは動かさない（表示の速さに影響させない）
  const listRef = useRef(null);
  const firstRun = useRef(true);
  const resultKey = results.map((post) => post.slug).join(',');
  useGSAP(
    () => {
      const isFirst = firstRun.current;
      firstRun.current = false;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cards = gsap.utils.toArray(listRef.current?.children ?? []);
        const targets = isFirst ? cards.filter((el) => el.getBoundingClientRect().top > window.innerHeight) : cards;
        if (!targets.length) return;
        gsap.set(targets, { opacity: 0, y: 20 });
        ScrollTrigger.batch(targets, {
          start: 'top bottom',
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.05, overwrite: true }),
        });
        // Tab キーで、まだ出ていないカードに移ったら、すぐに出す
        const showOnFocus = (e) => {
          const card = e.target.closest?.('.post-card');
          if (card) gsap.to(card, { opacity: 1, y: 0, duration: 0.2, overwrite: true });
        };
        listRef.current?.addEventListener('focusin', showOnFocus);
        const list = listRef.current;
        return () => list?.removeEventListener('focusin', showOnFocus);
      });
      return () => mm.revert();
    },
    { dependencies: [resultKey], revertOnUpdate: true },
  );

  return (
    <div className="post-search">
      <div className="search-box">
        <label htmlFor="post-search-input" className="search-label">
          {fixedCategory ? 'このカテゴリーの記事を探す' : '言葉で探す'}
        </label>
        <input
          id="post-search-input"
          type="search"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例：レシートプリンター　キャッシュレス"
          autoComplete="off"
        />
      </div>

      {!fixedCategory && (
        <div className="search-categories" role="group" aria-label="カテゴリーでしぼる">
          <button type="button" className="search-chip" aria-pressed={!category} onClick={() => setCategory('')}>
            すべて<span className="search-chip-count">{posts.length}</span>
          </button>
          {Object.entries(categories).map(([slug, name]) => (
            <button key={slug} type="button" className="search-chip" aria-pressed={category === slug} onClick={() => setCategory(slug)}>
              {shortName(name)}
              <span className="search-chip-count">{counts[slug] ?? 0}</span>
            </button>
          ))}
        </div>
      )}

      <p className="search-count" aria-live="polite">
        {terms.length || (category && !fixedCategory) ? `${results.length}件の記事が見つかりました` : `${results.length}件の記事`}
      </p>

      {results.length === 0 ? (
        <p className="search-empty">
          「{query}」に合う記事は見つかりませんでした。言葉を短くするか、
          {category && !fixedCategory ? 'カテゴリーを「すべて」にして' : 'ちがう言い方で'}探してみてください。
        </p>
      ) : (
        <ul className="card-grid" ref={listRef}>
          {results.map((post) => (
            <PostCard key={post.slug} post={post} showCategory={!fixedCategory} isLatest={latest.has(post.slug)} />
          ))}
        </ul>
      )}
    </div>
  );
}
