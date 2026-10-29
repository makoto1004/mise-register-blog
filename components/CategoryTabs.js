'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/site';

// カテゴリーを切り替えるタブ。current のカテゴリーは色を変えて「今ここ」を示す
// counts（カテゴリーごとの記事数）を渡すと、名前の横に数を出す
// スマホでタブが横にはみ出すときは、開いたときに今のカテゴリーのタブが見える位置まで横に動かす
export default function CategoryTabs({ current = '', counts = {} }) {
  const navRef = useRef(null);
  useEffect(() => {
    const nav = navRef.current;
    const tab = nav?.querySelector('[aria-current="page"]');
    if (nav && tab) nav.scrollLeft = tab.offsetLeft - (nav.clientWidth - tab.offsetWidth) / 2;
  }, [current]);

  return (
    <nav className="category-tabs" aria-label="カテゴリーを切り替える" ref={navRef}>
      <ul>
        {Object.entries(CATEGORIES).map(([slug, name]) => (
          <li key={slug}>
            <Link
              href={`/category/${slug}`}
              className="category-tab"
              aria-current={slug === current ? 'page' : undefined}
            >
              {name.replace(/向け$/, '').replace(/（共通）$/, '')}
              {counts[slug] != null && <span className="category-tab-count">{counts[slug]}</span>}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/search" className="category-tab category-tab-search">
            記事を探す
          </Link>
        </li>
      </ul>
    </nav>
  );
}
