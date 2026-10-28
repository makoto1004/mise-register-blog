'use client';

import { useEffect, useState } from 'react';
import { SITE } from '@/lib/site';

// Amazon のセールのバナー（アソシエイトの「コンテンツで使えるバナー画像」）
// サイトはビルド時に作られるので、期間の判定は見ている人のブラウザで行う（期間が終われば自動で消える）
// バナー画像は商標ガイドラインのため加工しない。リンクはアソシエイトのタグをつけて自分で作る
const SALE = {
  name: 'Amazon スマイルSale',
  start: '2026-11-04T09:00:00+09:00',
  end: '2026-11-12T23:59:59+09:00',
  period: '11/4（水）9:00〜11/12（木）23:59',
  image: '/images/amazon/smile-sale-2026-11-1200x1200.jpg',
  url: 'https://www.amazon.co.jp/events/monthlydealevent',
};

export function isSaleOpen(now = new Date()) {
  return now >= new Date(SALE.start) && now <= new Date(SALE.end);
}

export default function AmazonSaleBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(isSaleOpen());
  }, []);

  if (!show) return null;
  const url = new URL(SALE.url);
  if (SITE.amazonTag) url.searchParams.set('tag', SITE.amazonTag);
  return (
    <aside className="sale-banner" aria-label={SALE.name}>
      <p className="sale-banner-label">PR</p>
      <a href={url.toString()} target="_blank" rel="sponsored nofollow noopener">
        {/* eslint-disable-next-line @next/next/no-img-element -- Static Export のため next/image の最適化は使わない */}
        <img src={SALE.image} width="1200" height="1200" alt={`${SALE.name} ${SALE.period}`} loading="lazy" />
      </a>
      <p className="sale-banner-text">
        {SALE.name}は {SALE.period} まで。レジまわりの周辺機器をそろえるときにも、のぞいてみてください。
      </p>
    </aside>
  );
}
