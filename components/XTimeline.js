'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

// X（旧 Twitter）のタイムラインの埋め込み
// X の公式の埋め込み用スクリプト（widgets.js）を読み込む。
// X にログインしていない人には表示されないことがあるので、近くにフォローのボタンやリンクを必ず置く。
export default function XTimeline({ account, height = 560 }) {
  const ref = useRef(null);

  // スクリプトがすでに読み込まれている場合（パネルを開き直したときなど）は、埋め込みを描き直す
  useEffect(() => {
    if (window.twttr?.widgets && ref.current) window.twttr.widgets.load(ref.current);
  }, []);

  return (
    <div className="x-timeline" ref={ref}>
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
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (window.twttr?.widgets && ref.current) window.twttr.widgets.load(ref.current);
        }}
      />
    </div>
  );
}
