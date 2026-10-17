'use client';

import Script from 'next/script';

// X（旧 Twitter）のタイムラインの埋め込み
// X の公式の埋め込み用スクリプト（widgets.js）を読み込む。
// X にログインしていない人には表示されないことがあるので、下にフォローのボタン（XFollow）を必ず一緒に置く。
export default function XTimeline({ account, height = 560 }) {
  return (
    <div className="x-timeline">
      <a
        className="twitter-timeline"
        href={`https://twitter.com/${account}?ref_src=twsrc%5Etfw`}
        data-height={height}
        data-lang="ja"
        data-dnt="true"
        data-chrome="noheader nofooter noborders"
      >
        @{account} の投稿を X で見る
      </a>
      <Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" />
    </div>
  );
}
