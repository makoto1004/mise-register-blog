'use client';

import { useEffect, useState } from 'react';

// 楽天のセールのバナー（楽天アフィリエイトで発行したバナー）
// サイトはビルド時に作られるので、期間の判定は見ている人のブラウザで行う（期間が終われば自動で消える）
// リンクと画像は発行されたものをそのまま使い、画像は加工しない
const SALE = {
  name: '楽天お買い物マラソン＆ジャンル祭',
  start: '2026-11-04T20:00:00+09:00',
  end: '2026-11-11T01:59:59+09:00',
  period: '11/4（水）20:00〜11/11（水）1:59',
  image: 'https://hbb.afl.rakuten.co.jp/hsb/5921fd97.97dea88d.5921fc7f.4541790a/?me_id=1&me_adv_id=2794889&t=pict',
  url: 'https://hb.afl.rakuten.co.jp/hsc/5921fd97.97dea88d.5921fc7f.4541790a/?link_type=pict&ut=eyJwYWdlIjoic2hvcCIsInR5cGUiOiJwaWN0IiwiY29sIjoxLCJjYXQiOiI0NCIsImJhbiI6Mjc5NDg4OSwiYW1wIjpmYWxzZX0%3D',
};

export function isSaleOpen(now = new Date()) {
  return now >= new Date(SALE.start) && now <= new Date(SALE.end);
}

export default function RakutenSaleBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(isSaleOpen());
  }, []);

  if (!show) return null;
  return (
    <aside className="sale-banner sale-banner-small" aria-label={SALE.name}>
      <p className="sale-banner-label">PR</p>
      <a href={SALE.url} target="_blank" rel="sponsored nofollow noopener">
        {/* eslint-disable-next-line @next/next/no-img-element -- 楽天アフィリエイトが発行したバナー画像 */}
        <img src={SALE.image} width="300" height="300" alt={`${SALE.name} ${SALE.period}`} loading="lazy" />
      </a>
      <p className="sale-banner-text">
        {SALE.name}は {SALE.period} まで。エントリーが必要です。クーポンの条件は楽天市場の案内で確かめてください。
      </p>
    </aside>
  );
}
