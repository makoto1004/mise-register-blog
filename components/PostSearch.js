'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/site';

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

// 言葉の例（押すと入力欄に入り、そのまま探す）
const QUICK_WORDS = ['レシートプリンター', 'キャッシュレス決済', 'Wi-Fi・ネットワーク', 'キャッシュドロア', 'エラー・つながらない', '開業の費用'];

export default function PostSearch({ posts, categories, fixedCategory = '' }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(fixedCategory);
  // URL の条件を読み込むまでは、URL を書きかえない（読む前に消してしまわないように）
  const [ready, setReady] = useState(false);

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
  // 空白で区切った言葉は「すべて含む」、「・」で区切った言葉は「どれかを含む」で探す（例：Wi-Fi・ネットワーク）
  const terms = normalize(query).split(/\s+/).filter(Boolean).map((t) => t.split('・').filter(Boolean));
  const results = indexed
    .filter(({ post, text }) => (!category || post.category === category) && terms.every((alts) => alts.some((t) => text.includes(t))))
    .map(({ post }) => post);

  return (
    <div className="post-search">
      <form className="search-box" role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="post-search-input" className="search-label">
          {fixedCategory ? 'このカテゴリーの記事を探す' : '言葉で探す'}
        </label>
        <input
          id="post-search-input"
          type="search"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例：レシートプリンター"
          autoComplete="off"
          enterKeyHint="search"
        />
      </form>

      {!fixedCategory && (
        <>
          <div className="search-words" role="group" aria-label="よく探される言葉">
            {QUICK_WORDS.map((word) => (
              <button key={word} type="button" className="search-chip" aria-pressed={query === word} onClick={() => setQuery(word)}>
                {word}
              </button>
            ))}
          </div>
          <div className="search-select-row">
            <label htmlFor="post-search-category" className="search-label">
              お店の種類
            </label>
            <select id="post-search-category" className="search-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">すべて</option>
              {Object.entries(categories).map(([slug, name]) => (
                <option key={slug} value={slug}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <p className="search-count" aria-live="polite">
        {results.length}件
      </p>

      {results.length === 0 ? (
        <div className="search-empty">
          <p className="search-empty-title">見つかりませんでした。別の言葉で探してください（例：プリンター、Wi-Fi）</p>
          <p className="search-empty-actions">
            <Link href="/find" className="underline-link">
              POS レジを探す（3つの質問）
            </Link>
          </p>
        </div>
      ) : (
        <ul className="search-results">
          {results.map((post) => (
            <li key={post.slug} className="search-result">
              <Link href={`/posts/${post.slug}`} className="search-result-title">
                {post.title}
              </Link>
              {post.description && <p className="search-result-desc">{post.description}</p>}
              <p className="search-result-meta">
                <time dateTime={post.date}>{post.date.replaceAll('-', '/')}</time>
                {!fixedCategory && CATEGORIES[post.category] && <span>{CATEGORIES[post.category]}</span>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

