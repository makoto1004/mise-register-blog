'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// 開業準備チェックリストの本体（ブラウザの中だけで動く。ログインなし・サーバーに送らない）
// - 終わった項目と開業予定日を localStorage に保存し、次に開いたときに「前回の続き」から始められる
// - 次にやることを 1 つだけ大きく出す
// - 段階がすべて終わったら、画面の下で短くお祝いする
// - 「最初からやり直す」は確認ダイアログを出さず、数秒「元に戻す」を出す

const STORAGE_KEY = 'mise-opening-checklist-v1';
// お知らせを出しておく時間
const TOAST_DURATION_MS = 4000;
// 1 日のミリ秒
const DAY_MS = 24 * 60 * 60 * 1000;

// 保存した状態を読む（保存がない・壊れている・ストレージが使えないときは空にする）
function loadState() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    return {
      done: Array.isArray(saved?.done) ? saved.done.filter((id) => typeof id === 'string') : [],
      openDate: typeof saved?.openDate === 'string' ? saved.openDate : '',
    };
  } catch {
    return { done: [], openDate: '' };
  }
}

function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // プライベートモードなどで保存できないときは、この画面の中だけで使えるようにする
  }
}

// 今日から開業予定日までの日数（日付だけで比べる）
function daysUntil(dateText) {
  const [y, m, d] = dateText.split('-').map(Number);
  if (!y || !m || !d) return null;
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / DAY_MS);
}

function countdownText(days) {
  if (days === null) return '';
  if (days > 0) return `開業予定日まで、あと${days}日`;
  if (days === 0) return '今日が開業予定日です';
  return `開業予定日から${-days}日たちました`;
}

export default function OpeningChecklist({ stages }) {
  const [done, setDone] = useState([]);
  const [openDate, setOpenDate] = useState('');
  // 保存した状態を読み込むまでは保存しない（読む前に空で上書きしないように）
  const [ready, setReady] = useState(false);
  // 前回の続きから開いたとき
  const [welcomeBack, setWelcomeBack] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const allItems = stages.flatMap((stage) => stage.items.map((item) => ({ ...item, stageName: stage.name })));
  const doneSet = new Set(done);
  const total = allItems.length;
  const doneCount = allItems.filter((item) => doneSet.has(item.id)).length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;
  const nextItem = allItems.find((item) => !doneSet.has(item.id));
  const days = openDate ? daysUntil(openDate) : null;

  useEffect(() => {
    const saved = loadState();
    setDone(saved.done);
    setOpenDate(saved.openDate);
    setWelcomeBack(saved.done.length > 0);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveState({ done, openDate });
  }, [ready, done, openDate]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const showToast = (nextToast) => {
    clearTimeout(toastTimerRef.current);
    setToast(nextToast);
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  };

  // チェックを切り替える。段階が終わったとき・全部終わったときは短くお祝いする
  const toggleItem = (id) => {
    const nextDone = doneSet.has(id) ? done.filter((d) => d !== id) : [...done, id];
    setDone(nextDone);
    setWelcomeBack(false);
    if (doneSet.has(id)) return;

    const nextSet = new Set(nextDone);
    if (allItems.every((item) => nextSet.has(item.id))) {
      showToast({ message: 'すべての準備が終わりました。開店、おめでとうございます！' });
      return;
    }
    const stage = stages.find((s) => s.items.some((item) => item.id === id));
    if (stage && stage.items.every((item) => nextSet.has(item.id))) {
      showToast({ message: `「${stage.name}」が終わりました。おつかれさまです。` });
    }
  };

  // 最初からやり直す（数秒だけ元に戻せる）
  const resetAll = () => {
    const previous = done;
    setDone([]);
    setWelcomeBack(false);
    showToast({
      message: 'チェックをすべて外しました',
      actionLabel: '元に戻す',
      onAction: () => {
        setDone(previous);
        showToast({ message: 'チェックを元に戻しました' });
      },
    });
  };

  return (
    <div className="checklist">
      <section className="checklist-summary" aria-label="進み具合">
        <div className="checklist-progress-head">
          <p className="checklist-progress-count">
            <strong>{doneCount}</strong> / {total} 完了
          </p>
          {days !== null && <p className="checklist-countdown">{countdownText(days)}</p>}
        </div>
        <div
          className="checklist-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={doneCount}
          aria-label="終わった項目の数"
        >
          <span style={{ width: `${percent}%` }} />
        </div>
        <label className="checklist-date">
          開業予定日
          <input type="date" value={openDate} onChange={(e) => setOpenDate(e.target.value)} />
        </label>
        {welcomeBack && nextItem && (
          <p className="checklist-welcome">おかえりなさい。前回はここまで進みました。続きから始めましょう。</p>
        )}
      </section>

      {nextItem ? (
        <section className="checklist-next" aria-labelledby="checklist-next-heading">
          <p className="checklist-next-label" id="checklist-next-heading">
            次にやること
            <span className="checklist-next-stage">{nextItem.stageName}</span>
          </p>
          <p className="checklist-next-title">{nextItem.title}</p>
          <p className="checklist-next-text">{nextItem.text}</p>
          <div className="checklist-next-actions">
            {nextItem.links.map((link) => (
              <Link key={link.slug} href={`/posts/${link.slug}`} className="checklist-link">
                {link.label}の記事を読む
              </Link>
            ))}
            <button type="button" className="checklist-done-button" onClick={() => toggleItem(nextItem.id)}>
              終わった
            </button>
          </div>
        </section>
      ) : (
        ready && (
          <section className="checklist-next checklist-complete">
            <p className="checklist-next-title">すべての準備が終わりました</p>
            <p className="checklist-next-text">おつかれさまでした。開店してから困ったときは、記事やAI相談デスクも使ってください。</p>
          </section>
        )
      )}

      <ol className="checklist-stages">
        {stages.map((stage) => {
          const stageDone = stage.items.filter((item) => doneSet.has(item.id)).length;
          const complete = stageDone === stage.items.length;
          return (
            <li key={stage.id} className={complete ? 'checklist-stage is-complete' : 'checklist-stage'}>
              <h2>
                {stage.name}
                <span className="checklist-stage-count">
                  {complete ? '済' : `${stageDone} / ${stage.items.length}`}
                </span>
              </h2>
              <ul>
                {stage.items.map((item) => {
                  const checked = doneSet.has(item.id);
                  return (
                    <li key={item.id} className={checked ? 'checklist-item is-done' : 'checklist-item'}>
                      <label>
                        <input type="checkbox" checked={checked} onChange={() => toggleItem(item.id)} />
                        <span className="checklist-item-title">{item.title}</span>
                      </label>
                      <p className="checklist-item-text">{item.text}</p>
                      {item.links.length > 0 && (
                        <p className="checklist-item-links">
                          関連する記事：
                          {item.links.map((link) => (
                            <Link key={link.slug} href={`/posts/${link.slug}`} className="underline-link">
                              {link.label}
                            </Link>
                          ))}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>

      <div className="checklist-footer">
        <p>チェックの状態と開業予定日は、このブラウザの中だけに保存します。サーバーには送りません。</p>
        {doneCount > 0 && (
          <button type="button" className="checklist-reset" onClick={resetAll}>
            最初からやり直す
          </button>
        )}
      </div>

      <div className="checklist-toast-region" role="status" aria-live="polite">
        {toast && (
          <div className="checklist-toast">
            <span>{toast.message}</span>
            {toast.actionLabel && (
              <button type="button" onClick={toast.onAction}>
                {toast.actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
