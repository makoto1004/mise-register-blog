import { SITE } from '@/lib/site';

// X（旧 Twitter）へのリンク。X の外部スクリプトは読み込まず、普通のリンクで作る（軽く、Cookie も使わない）

// X のロゴ（Simple Icons の形をもとにした SVG）
export function XLogo({ className = 'x-logo' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

const profileUrl = `https://x.com/${SITE.xAccount}`;
const instagramUrl = `https://www.instagram.com/${SITE.instagramAccount}/`;

// Instagram のロゴ（線のカメラの形）
export function InstagramLogo({ className = 'x-logo' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.3" cy="6.7" r="1.3" fill="currentColor" />
    </svg>
  );
}

// ヘッダー用の Instagram の小さなリンク
export function InstagramHeaderLink() {
  return (
    <a href={instagramUrl} className="x-header-link" target="_blank" rel="noopener noreferrer me" aria-label={`Instagram（@${SITE.instagramAccount}）`}>
      <InstagramLogo />
    </a>
  );
}

// ヘッダー用の小さなリンク
export function XHeaderLink() {
  return (
    <a href={profileUrl} className="x-header-link" target="_blank" rel="noopener noreferrer me" aria-label={`X（@${SITE.xAccount}）`}>
      <XLogo />
    </a>
  );
}

// フォローの案内（トップページ・記事の最後）
export function XFollow({ lead = 'X と Instagram で、新着記事やお店づくりのヒントをお知らせしています。' }) {
  return (
    <div className="x-follow">
      <p>{lead}</p>
      <a href={profileUrl} className="x-button" target="_blank" rel="noopener noreferrer me">
        <XLogo />@{SITE.xAccount} をフォロー
      </a>
      <a href={instagramUrl} className="x-button x-share" target="_blank" rel="noopener noreferrer me">
        <InstagramLogo />Instagram を見る
      </a>
    </div>
  );
}

// 記事を X でシェアするボタン（投稿画面にタイトルと URL が入った状態で開く）
export function XShare({ title, path }) {
  const url = new URL('https://x.com/intent/post');
  url.searchParams.set('text', title);
  url.searchParams.set('url', `${SITE.url}${path}`);
  url.searchParams.set('via', SITE.xAccount);
  return (
    <a href={url.toString()} className="x-button x-share" target="_blank" rel="noopener noreferrer">
      <XLogo />X でシェアする
    </a>
  );
}
