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

// ヘッダー用の小さなリンク
export function XHeaderLink() {
  return (
    <a href={profileUrl} className="x-header-link" target="_blank" rel="noopener noreferrer me" aria-label={`X（@${SITE.xAccount}）`}>
      <XLogo />
    </a>
  );
}

// フォローの案内（トップページ・記事の最後）
export function XFollow({ lead = 'X で新着記事や、お店づくりのヒントをお知らせしています。' }) {
  return (
    <div className="x-follow">
      <p>{lead}</p>
      <a href={profileUrl} className="x-button" target="_blank" rel="noopener noreferrer me">
        <XLogo />@{SITE.xAccount} をフォロー
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
