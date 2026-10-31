'use client';

import { useEffect } from 'react';
import { sendGAEvent } from '@next/third-parties/google';

// 広告リンク（rel="sponsored" の付いたリンク）が押されたら、Google アナリティクスにイベント affiliate_click を送る。
// どの記事で・どの広告が・カードのどこから押されたかを数え、収入につながる記事や置き場所を見つけるために使う。
// 個人を特定する情報は送らない（送るのは広告の名前・広告の会社・置き場所・記事の URL だけ）

// 広告の会社（リンク先のドメインから判断する）
function networkOf(url) {
  const host = url.hostname;
  if (/amazon\.co\.jp$|amzn\.to$/.test(host)) return 'amazon';
  if (/rakuten\.co\.jp$/.test(host)) return 'rakuten';
  if (/a8\.net$/.test(host)) return 'a8';
  return host;
}

// 広告の名前と置き場所（カードの見出しから取る。どのカードでもなければリンクの文字）
const PLACES = [
  ['.product-card', '.product-name', 'product'],
  ['.service-card', '.service-name', 'service'],
  ['.pick-card', '.pick-name', 'pick'],
  ['.sale-banner', null, 'sale'],
];

function describe(link) {
  for (const [card, name, place] of PLACES) {
    const box = link.closest(card);
    if (!box) continue;
    const label = name ? box.querySelector(name)?.textContent : box.getAttribute('aria-label');
    return { place, name: label };
  }
  return { place: 'other', name: link.textContent };
}

// カードの中のどこを押したか（画像・バナー・ボタン）
function partOf(link) {
  if (link.querySelector('img:not(.service-pixel)')) return 'image';
  if (/button/.test(link.className)) return 'button';
  return 'link';
}

export default function AffiliateClickTracker() {
  useEffect(() => {
    const onClick = (event) => {
      // 左クリック・Enter キー（click）と、ホイールでの新しいタブ（auxclick の真ん中ボタン）を数える
      if (event.type === 'auxclick' && event.button !== 1) return;
      const link = event.target.closest?.('a[rel~="sponsored"]');
      if (!link) return;
      let url;
      try {
        url = new URL(link.href);
      } catch {
        return;
      }
      const { place, name } = describe(link);
      sendGAEvent('event', 'affiliate_click', {
        ad_name: (name ?? '').trim().replace(/\s+/g, ' ').slice(0, 100),
        ad_network: networkOf(url),
        ad_place: place,
        ad_part: partOf(link),
        article: location.pathname,
      });
    };
    document.addEventListener('click', onClick);
    document.addEventListener('auxclick', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('auxclick', onClick);
    };
  }, []);
  return null;
}
