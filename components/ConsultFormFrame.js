'use client';

import { useState } from 'react';

// AI相談デスクの Google フォームの埋め込み
// 読み込みが終わるまでは「読み込み中」を重ねて出し、フォームが表示されないときのために新しいタブで開くリンクも出す
export default function ConsultFormFrame({ src, openUrl }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="consult-frame-wrap">
      <iframe
        className="contact-frame"
        src={src}
        title="AI相談デスクのフォーム"
        loading="lazy"
        onLoad={() => setLoaded(true)}
      >
        読み込んでいます…
      </iframe>
      {!loaded && (
        <p className="consult-frame-loading" role="status">
          フォームを読み込んでいます…
        </p>
      )}
      <p className="consult-frame-fallback">
        フォームが表示されないときは、
        <a href={openUrl} target="_blank" rel="noopener noreferrer">
          新しいタブでフォームを開く
        </a>
        ことができます。
      </p>
    </div>
  );
}
