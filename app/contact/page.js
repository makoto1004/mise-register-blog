import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'お問い合わせ・ご意見',
  description: '記事へのご意見・ご質問、掲載のご相談などはこちらのフォームからお送りください。',
  alternates: { canonical: '/contact' },
};

// Google フォームの URL から、埋め込み用の URL を作る（?embedded=true を付ける）
function embedUrl(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith('google.com')) return '';
    u.searchParams.set('embedded', 'true');
    return u.toString();
  } catch {
    return '';
  }
}

// お問い合わせ・ご意見（コメント）を受け付けるページ
export default function ContactPage() {
  const src = SITE.contactFormUrl ? embedUrl(SITE.contactFormUrl) : '';

  return (
    <article className="article">
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <Link href="/">ホーム</Link> › <span>お問い合わせ・ご意見</span>
      </nav>
      <h1 className="page-title">お問い合わせ・ご意見</h1>
      <div className="post-body">
        <p>
          記事へのご意見・ご質問、「こんな記事を読みたい」というリクエスト、お店の掲載に関するご相談などは、下のフォームからお送りください。
        </p>
        <ul>
          <li>いただいた内容は、記事の改善や返信のためだけに使います（詳しくは<Link href="/about">プライバシーポリシー</Link>）。</li>
          <li>返信が必要な場合は、フォームに連絡先をご記入ください。内容によっては返信できない場合があります。</li>
          <li>個別のお店の経営判断や、税金・許可の個別相談にはお答えできません。</li>
        </ul>
      </div>

      {src ? (
        <iframe className="contact-frame" src={src} title="お問い合わせフォーム" loading="lazy">
          読み込んでいます…
        </iframe>
      ) : (
        <p className="feedback-box">お問い合わせフォームは準備中です。</p>
      )}
    </article>
  );
}
