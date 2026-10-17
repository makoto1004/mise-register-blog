'use client';

import Script from 'next/script';

// 選んだ X の投稿の埋め込み（1 ページ最大 3 件）
// X 公式の埋め込み（widgets.js）が読み込めない・表示できない場合は、投稿へのリンクとして表示される
export const MAX_X_POSTS = 3;

export default function XPostEmbeds({ urls }) {
  const posts = (urls ?? []).filter((u) => /^https:\/\/(x|twitter)\.com\/[^/]+\/status\/\d+/.test(u)).slice(0, MAX_X_POSTS);
  if (posts.length === 0) return null;
  return (
    <div className="x-posts">
      {posts.map((url) => (
        <blockquote key={url} className="twitter-tweet" data-dnt="true" data-lang="ja" data-conversation="none">
          <a href={url.replace('https://x.com/', 'https://twitter.com/')}>X の投稿を見る</a>
        </blockquote>
      ))}
      <Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" />
    </div>
  );
}
