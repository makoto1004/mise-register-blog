'use client';

import { useEffect, useState } from 'react';

// Creators API で取った画像と価格を表示する。
// 規約（Amazon.co.jp の PA-API ライセンス契約）で、価格などは取ってから 24 時間まで、画像は URL を 24 時間まで使える。
// サイトの作り直しが止まっても古い情報を出さないよう、読者のブラウザで取った時刻を確かめ、24 時間を過ぎていたら出さない
const LIMIT_MS = 24 * 60 * 60 * 1000;

// 規約で、価格の横に時刻を出す（同じ日なら日付を省いてよいが、静的なページなので日付も出す）
function formatTime(iso) {
  return new Date(iso).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AmazonLiveInfo({ item, alt, part }) {
  const [fresh, setFresh] = useState(false);
  useEffect(() => {
    setFresh(Date.now() - new Date(item.fetchedAt).getTime() < LIMIT_MS);
  }, [item.fetchedAt]);
  if (!fresh) return null;

  if (part === 'image') {
    return item.image ? (
      <a href={item.url} target="_blank" rel="sponsored nofollow noopener" className="product-thumb-link">
        {/* eslint-disable-next-line @next/next/no-img-element -- Amazon の画像は保存せず、API が返した URL をそのまま表示する決まり */}
        <img src={item.image.url} width={item.image.width} height={item.image.height} alt={alt} className="product-thumb" loading="lazy" />
      </a>
    ) : null;
  }

  return item.price ? (
    <div className="amazon-price">
      <p>
        Amazon.co.jp 価格：<strong>{item.price}</strong>
        <span className="amazon-price-time">（{formatTime(item.fetchedAt)}時点）</span>
      </p>
      {/* 規約で決められた注意書き（文言を変えない） */}
      <p className="amazon-price-note">
        価格および発送可能時期は表示された日付/時刻の時点のものであり、変更される場合があります。本商品の購入においては、購入の時点でAmazon.co.jpに表示されている価格および発送可能時期の情報が適用されます。
      </p>
    </div>
  ) : null;
}
