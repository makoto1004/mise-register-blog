'use client';

import { useEffect, useRef, useState } from 'react';
import XTimeline from '@/components/XTimeline';
import { XLogo } from '@/components/XLinks';

// ヘッダー右上の X のマーク。押すと、その下に X のタイムラインのパネルが開く
// X の読み込みは、パネルを開いたときだけ行う（開かなければページは重くならず、X にも情報を送らない）
export default function XHeaderTimeline({ account }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // パネルの外を押す・Esc キーで閉じる
  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const profileUrl = `https://x.com/${account}`;

  return (
    <div className="x-header-wrap" ref={wrapRef}>
      <button
        type="button"
        className="x-header-link"
        aria-expanded={open}
        aria-controls="x-header-panel"
        aria-label={`X（@${account}）のタイムラインを開く`}
        onClick={() => setOpen((v) => !v)}
      >
        <XLogo />
      </button>
      {open && (
        <div id="x-header-panel" className="x-header-panel" role="dialog" aria-label={`@${account} のタイムライン`}>
          <div className="x-header-panel-head">
            <span>@{account} の投稿</span>
            <button type="button" className="x-header-close" onClick={() => setOpen(false)} aria-label="閉じる">
              ×
            </button>
          </div>
          <XTimeline account={account} height={460} />
          <div className="x-header-panel-foot">
            <span>表示されない場合は X で見られます</span>
            <a href={profileUrl} className="x-button" target="_blank" rel="noopener noreferrer me">
              <XLogo />
              フォロー
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
