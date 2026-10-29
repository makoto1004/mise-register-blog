'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// スクロールすると下からふわっと出てくる部品（記事一覧のカードは PostSearch が自分で動かす）
const REVEAL_SELECTOR = [
  '.latest-card',
  '.home-section > .section-head',
  '.featured-post',
  '.post-rows > li',
  '.pick-card',
  '.product-card',
].join(',');

// サイト全体の動き（GSAP）
// ・画面の下にある部品を、スクロールで見えたときにふわっと出す（最初から画面に見えている部品は動かさない＝表示の速さに影響させない）
// ・記事のページでは、画面のいちばん上に「どこまで読んだか」の細いバーを出す
// ・トップページの AI相談デスクのマスコットを、小さくゆらす
// 端末で「視差効果を減らす」を選んでいる人には、どれも動かさない
export default function SiteMotion() {
  const pathname = usePathname();
  const progressRef = useRef(null);
  const isPost = pathname.startsWith('/posts/');

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const below = gsap.utils.toArray(REVEAL_SELECTOR).filter((el) => el.getBoundingClientRect().top > window.innerHeight);
        if (below.length) {
          // 見た目だけを消す（visibility は残すので、Tab キーでリンクに移れる）
          gsap.set(below, { opacity: 0, y: 24 });
          ScrollTrigger.batch(below, {
            start: 'top 92%',
            once: true,
            onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08, overwrite: true }),
          });
        }

        if (progressRef.current) {
          gsap.fromTo(
            progressRef.current,
            { scaleX: 0 },
            { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 } },
          );
        }

        gsap.to('.home-consult-mascots img', { y: -5, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.7 });
      });

      // Tab キーで、まだ出ていない部品に移ったら、すぐに出す
      const showOnFocus = (e) => {
        const target = e.target.closest?.(REVEAL_SELECTOR);
        if (target) gsap.to(target, { opacity: 1, y: 0, duration: 0.2, overwrite: true });
      };
      document.addEventListener('focusin', showOnFocus);
      return () => {
        document.removeEventListener('focusin', showOnFocus);
        mm.revert();
      };
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return isPost ? <div className="reading-progress" ref={progressRef} aria-hidden="true" /> : null;
}
