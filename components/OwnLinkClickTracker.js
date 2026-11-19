'use client';

import { useEffect } from 'react';
import { sendGAEvent } from '@next/third-parties/google';

// 運営者の販売ページ（BOOTH のテンプレート・ココナラなどの作業代行）へのリンクが押されたら、
// Google アナリティクスにイベント own_link_click を送る。
// 「X → 記事 → 販売ページ」のどこで人が止まっているかを見て、売上に近い記事を見つけるために使う。
// 個人を特定する情報は送らない（送るのはサイトの種類・リンク先のページ・リンクの文字・記事の URL だけ）

// リンク先のドメインとサイトの種類
const SITES = [
  [/(^|\.)booth\.pm$/, 'booth'],
  [/(^|\.)coconala\.com$/, 'coconala'],
  [/(^|\.)lancers\.jp$/, 'lancers'],
  [/(^|\.)crowdworks\.jp$/, 'crowdworks'],
];

function siteOf(url) {
  for (const [pattern, site] of SITES) {
    if (pattern.test(url.hostname)) return site;
  }
  return null;
}

export default function OwnLinkClickTracker() {
  useEffect(() => {
    const onClick = (event) => {
      // 左クリック・Enter キー（click）と、ホイールでの新しいタブ（auxclick の真ん中ボタン）を数える
      if (event.type === 'auxclick' && event.button !== 1) return;
      const link = event.target.closest?.('a[href]');
      // 広告リンクは AffiliateClickTracker が数えるので、ここでは数えない
      if (!link || /\bsponsored\b/.test(link.rel)) return;
      let url;
      try {
        url = new URL(link.href);
      } catch {
        return;
      }
      const site = siteOf(url);
      if (!site) return;
      sendGAEvent('event', 'own_link_click', {
        link_site: site,
        link_page: url.pathname.slice(0, 100),
        link_label: (link.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 100),
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
