import Link from 'next/link';
import { JOURNEY_STEPS } from '@/lib/journey';

// 記事の本文のすぐ後に出す「次の一歩」。広告ではなく、このサイトの中のページだけを案内する
// 開業したあとの記事（道のり4・家具・豆知識）は、困りごとの一覧へ。ほかは、レジ選びの3つの質問へ
const AFTER = JOURNEY_STEPS.find((step) => step.id === 'after');
const AFTER_SLUGS = new Set([...AFTER.slugs, ...AFTER.sections.flatMap((section) => section.slugs)]);
const COST_SLUG = 'pos-cost-guide-2026';

export default function NextStep({ slug, hasCostGuide }) {
  const links = AFTER_SLUGS.has(slug)
    ? [
        { href: AFTER.path, label: '開業したあとの記事をまとめて見る' },
        { href: '/find', label: 'レジを選び直す（3つの質問）' },
      ]
    : [
        { href: '/find', label: '3つの質問でレジを探す' },
        slug !== COST_SLUG && hasCostGuide
          ? { href: `/posts/${COST_SLUG}`, label: 'POSレジの費用を表で比べる' }
          : { href: '/opening-checklist', label: '開業準備チェックリスト' },
      ];
  return (
    <nav className="next-step" aria-label="次の一歩">
      <p className="next-step-title">次の一歩</p>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
