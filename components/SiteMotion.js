'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// スクロールすると下からふわっと出てくる部品
const REVEAL_SELECTOR = ['.latest-card', '.pick-card', '.product-card'].join(',');

// サイト全体の動き（2026-11-25 に、GSAP から CSS と IntersectionObserver に替えた。記事の JavaScript を軽くするため）
// ・画面の下にある部品を、スクロールで見えたときにふわっと出す（最初から画面に見えている部品は動かさない＝表示の速さに影響させない）
// ・記事のページでは、画面のいちばん上に「どこまで読んだか」の細いバーを出す
// 端末で「視差効果を減らす」を選んでいる人には、どれも動かさない
export default function SiteMotion() {
  const pathname = usePathname();
  const progressRef = useRef(null);
  const isPost = pathname.startsWith('/posts/');

  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return undefined;
    const cleanups = [];

    // 見た目だけを消す（visibility は残すので、Tab キーでリンクに移れる）
    const below = [...document.querySelectorAll(REVEAL_SELECTOR)].filter((el) => el.getBoundingClientRect().top > window.innerHeight);
    if (below.length && 'IntersectionObserver' in window) {
      below.forEach((el) => el.classList.add('reveal-wait'));
      const show = (el, delay = 0) => {
        if (!el.classList.contains('reveal-wait')) return;
        el.style.animationDelay = `${delay}ms`;
        el.classList.remove('reveal-wait');
        el.classList.add('reveal-in');
      };
      const observer = new IntersectionObserver(
        (entries) => {
          entries.filter((e) => e.isIntersecting).forEach((e, i) => {
            show(e.target, i * 80);
            observer.unobserve(e.target);
          });
        },
        { rootMargin: '0px 0px -8% 0px' },
      );
      below.forEach((el) => observer.observe(el));
      // Tab キーで、まだ出ていない部品に移ったら、すぐに出す
      const showOnFocus = (e) => {
        const target = e.target.closest?.(REVEAL_SELECTOR);
        if (target) show(target);
      };
      document.addEventListener('focusin', showOnFocus);
      cleanups.push(() => {
        observer.disconnect();
        document.removeEventListener('focusin', showOnFocus);
        below.forEach((el) => {
          el.classList.remove('reveal-wait', 'reveal-in');
          el.style.animationDelay = '';
        });
      });
    }

    const bar = progressRef.current;
    if (bar) {
      let frame = 0;
      const update = () => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      };
      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(update);
      };
      update();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      cleanups.push(() => {
        cancelAnimationFrame(frame);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return isPost ? <div className="reading-progress" ref={progressRef} aria-hidden="true" /> : null;
}
