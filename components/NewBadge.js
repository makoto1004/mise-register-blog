'use client';

import { useEffect, useState } from 'react';

// 公開から NEW_DAYS 日以内の記事に付ける「NEW」の印
// サイトはビルド時に作られるので、日付の判定は見ている人のブラウザで行う（日がたてば自動で消える）
const NEW_DAYS = 7;

export function isRecent(date, now = new Date()) {
  const published = new Date(`${date}T00:00:00+09:00`);
  if (Number.isNaN(published.getTime())) return false;
  const days = (now.getTime() - published.getTime()) / (24 * 60 * 60 * 1000);
  return days >= 0 && days < NEW_DAYS;
}

export default function NewBadge({ date }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(isRecent(date));
  }, [date]);

  if (!show) return null;
  return <span className="new-badge">NEW</span>;
}
