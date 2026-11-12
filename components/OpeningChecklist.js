'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import CostSimulator, { calcCostTotals } from '@/components/CostSimulator';
import { buildConsultText, diagnose } from '@/lib/openingDiagnosis';

// 開業準備チェックリストの本体（ブラウザの中だけで動く。ログインなし・サーバーに送らない）
// - 終わった項目・開業予定日・初期費用シミュレーターの金額を localStorage に保存し、次に開いたときに「前回の続き」から始められる
// - 次にやることを 1 つだけ大きく出す
// - 段階がすべて終わったら、画面の下で短くお祝いする
// - 「最初からやり直す」は確認ダイアログを出さず、数秒「元に戻す」を出す
// - 「かんたん診断」は AI を使わず、開業予定日までの日数と残りの項目から注意を出す（lib/openingDiagnosis.js）
// - 「AI無料POSレジ診断に出す」は、今の状況を相談文にしてコピーする（フォームに貼ってもらう。自動では送らない）
// - ほかの端末で続けるときは、状態を入れた「引き継ぎ用のURL」を使う。状態は URL の # の後ろに入れるので、サーバーには送られない

const STORAGE_KEY = 'mise-opening-checklist-v1';
// 引き継ぎ用のURLで、状態を入れる # の後ろの名前
const SHARE_PREFIX = '#data=';
// お知らせを出しておく時間
const TOAST_DURATION_MS = 4000;
// 1 日のミリ秒
const DAY_MS = 24 * 60 * 60 * 1000;
// シミュレーターを置く項目
const COST_ITEM_ID = 'initial-cost';
// シミュレーターで選べる業種（value は CostSimulator の業種の名前。other は店舗を借りるお店の共通の項目）
const SIM_CATEGORIES = [
  { value: 'cafe', label: 'カフェ・飲食店' },
  { value: 'salon', label: '美容院・サロン' },
  { value: 'kitchen-car', label: 'キッチンカー' },
  { value: 'apparel', label: 'アパレル・雑貨店' },
  { value: 'other', label: 'そのほかのお店' },
];

const EMPTY_STATE = { done: [], openDate: '', simCategory: 'cafe', sim: null };

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

// 保存した内容や URL から読んだ内容は、形がおかしいものを捨ててから使う
function pickEntries(obj, isValid) {
  if (!isPlainObject(obj)) return {};
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([key, value]) => key.length <= 40 && isValid(value))
      .slice(0, 60),
  );
}

function sanitizeSimPart(part) {
  if (!isPlainObject(part)) return null;
  return {
    values: pickEntries(part.values, (v) => typeof v === 'string' && v.length <= 20),
    qty: pickEntries(part.qty, (v) => Number.isInteger(v) && v >= 1 && v <= 10),
    unchecked: pickEntries(part.unchecked, (v) => typeof v === 'boolean'),
  };
}

function sanitizeSim(sim) {
  if (!isPlainObject(sim)) return null;
  const init = sanitizeSimPart(sim.init);
  const monthly = sanitizeSimPart(sim.monthly);
  if (!init || !monthly) return null;
  return {
    init,
    monthly,
    sales: typeof sim.sales === 'string' ? sim.sales.slice(0, 20) : '',
    rate: typeof sim.rate === 'string' ? sim.rate.slice(0, 10) : '',
  };
}

function sanitizeState(saved) {
  if (!isPlainObject(saved)) return EMPTY_STATE;
  return {
    done: Array.isArray(saved.done) ? saved.done.filter((id) => typeof id === 'string' && id.length <= 40).slice(0, 100) : [],
    openDate: typeof saved.openDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(saved.openDate) ? saved.openDate : '',
    simCategory: SIM_CATEGORIES.some((c) => c.value === saved.simCategory) ? saved.simCategory : 'cafe',
    sim: sanitizeSim(saved.sim),
  };
}

// 保存した状態を読む（保存がない・壊れている・ストレージが使えないときは空にする）
function loadState() {
  try {
    return sanitizeState(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null'));
  } catch {
    return EMPTY_STATE;
  }
}

function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // プライベートモードなどで保存できないときは、この画面の中だけで使えるようにする
  }
}

// 状態を URL に入れられる文字（base64url）にする。金額の欄に全角の文字が入っても壊れないよう UTF-8 で扱う
function encodeShare(state) {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeShare(text) {
  try {
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return sanitizeState(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return null;
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

// consultAvailable：AI無料POSレジ診断のフォームがあるとき true
export default function OpeningChecklist({ stages, consultAvailable = false }) {
  const [done, setDone] = useState([]);
  const [openDate, setOpenDate] = useState('');
  const [simCategory, setSimCategory] = useState('cafe');
  const [sim, setSim] = useState(null);
  // シミュレーターを開いているか
  const [simOpen, setSimOpen] = useState(false);
  // 保存した内容や URL から読み直したときに、シミュレーターを作り直すための番号
  const [simVersion, setSimVersion] = useState(0);
  // 保存した状態を読み込むまでは保存しない（読む前に空で上書きしないように）
  const [ready, setReady] = useState(false);
  // 前回の続きから開いたとき
  const [welcomeBack, setWelcomeBack] = useState(false);
  const [toast, setToast] = useState(null);
  // クリップボードにコピーできなかったときに、手でコピーしてもらう URL と相談文
  const [shareFallback, setShareFallback] = useState('');
  const [consultFallback, setConsultFallback] = useState('');
  const simRef = useRef(null);

  const allItems = stages.flatMap((stage) => stage.items.map((item) => ({ ...item, stageName: stage.name })));
  const doneSet = new Set(done);
  const total = allItems.length;
  const doneCount = allItems.filter((item) => doneSet.has(item.id)).length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;
  const nextItem = allItems.find((item) => !doneSet.has(item.id));
  const days = openDate ? daysUntil(openDate) : null;
  const remainingIds = allItems.filter((item) => !doneSet.has(item.id)).map((item) => item.id);
  const diagnosis = ready ? diagnose({ days, remainingIds }) : [];
  // シミュレーターを一度でも開いて入力したときだけ、合計を相談文に入れる
  const totals = sim ? calcCostTotals(simCategory, sim) : null;

  const showToast = useCallback((nextToast) => setToast(nextToast), []);

  // お知らせは、出るたびに数秒後に消す（新しいお知らせが出たら、そこから数え直す）
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const applyState = useCallback((state) => {
    setDone(state.done);
    setOpenDate(state.openDate);
    setSimCategory(state.simCategory);
    setSim(state.sim);
    setSimVersion((v) => v + 1);
  }, []);

  // 最初の読み込みは 1 回だけにする（開発中は React が確認のため 2 回動かし、URL の # を消したあとに空で上書きしてしまうため）
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const saved = loadState();
    // 引き継ぎ用のURLから開いたときは、URL の内容で始める（数秒だけ元に戻せる）
    const hash = window.location.hash;
    const shared = hash.startsWith(SHARE_PREFIX) ? decodeShare(hash.slice(SHARE_PREFIX.length)) : null;
    if (hash.startsWith(SHARE_PREFIX)) {
      // 読み込んだあとは # の後ろを消す（再読み込みで何度も読み込まないように）
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    if (shared) {
      applyState(shared);
      setSimOpen(Boolean(shared.sim));
      showToast({
        message: '引き継ぎ用のURLから読み込みました',
        actionLabel: '元に戻す',
        onAction: () => {
          applyState(saved);
          showToast({ message: 'この端末の前の内容に戻しました' });
        },
      });
    } else {
      applyState(saved);
      setWelcomeBack(saved.done.length > 0);
      if (hash.startsWith(SHARE_PREFIX)) showToast({ message: '引き継ぎ用のURLを読み込めませんでした。URLが最後までコピーされているか確かめてください' });
    }
    setReady(true);
  }, [applyState, showToast]);

  useEffect(() => {
    if (ready) saveState({ done, openDate, simCategory, sim });
  }, [ready, done, openDate, simCategory, sim]);


  // シミュレーターの入力が変わったら保存する
  const changeSim = useCallback((data) => setSim(data), []);

  // 業種を変えると、その業種の目安の金額で始め直す
  const changeSimCategory = (value) => {
    setSimCategory(value);
    setSim(null);
    setSimVersion((v) => v + 1);
  };

  // 「次にやること」からシミュレーターを開いて、そこまで移動する
  const openSimulator = () => {
    setSimOpen(true);
    requestAnimationFrame(() => simRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
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

  // 引き継ぎ用のURLを作ってコピーする（コピーできないときは、URL を表示して手でコピーしてもらう）
  const copyShareUrl = async () => {
    const url = `${window.location.origin}${window.location.pathname}${SHARE_PREFIX}${encodeShare({ done, openDate, simCategory, sim })}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareFallback('');
      showToast({ message: '引き継ぎ用のURLをコピーしました。ほかの端末で開くと、続きから始められます' });
    } catch {
      setShareFallback(url);
    }
  };

  // 今の状況を相談文にしてコピーする（コピーできないときは、相談文を表示して手でコピーしてもらう）
  const copyConsultText = async () => {
    const text = buildConsultText({
      categoryLabel: sim ? SIM_CATEGORIES.find((c) => c.value === simCategory)?.label : '',
      openDate,
      days,
      doneCount,
      total,
      remainingByStage: stages
        .map((stage) => ({ name: stage.name, titles: stage.items.filter((item) => !doneSet.has(item.id)).map((item) => item.title) }))
        .filter((stage) => stage.titles.length > 0),
      totals,
    });
    try {
      await navigator.clipboard.writeText(text);
      setConsultFallback('');
      showToast({ message: '相談文をコピーしました。AI無料POSレジ診断のフォームの相談内容に貼り付けてください' });
    } catch {
      setConsultFallback(text);
    }
  };

  const renderSimulator = () => (
    <div className="checklist-sim" ref={simRef}>
      <label className="checklist-sim-category">
        お店の種類
        <select value={simCategory} onChange={(e) => changeSimCategory(e.target.value)}>
          {SIM_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <CostSimulator
        key={`${simCategory}-${simVersion}`}
        category={simCategory}
        savedData={sim}
        onDataChange={changeSim}
        embedded
      />
    </div>
  );

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

      {diagnosis.length > 0 && (
        <section className="checklist-diagnosis" aria-labelledby="checklist-diagnosis-heading">
          <h2 id="checklist-diagnosis-heading">かんたん診断</h2>
          <ul>
            {diagnosis.map((d) => (
              <li key={d.text} className={`checklist-diagnosis-${d.level}`}>
                <span className="checklist-diagnosis-mark">{d.level === 'warn' ? '急ぎ' : d.level === 'good' ? '順調' : '目安'}</span>
                {d.text}
              </li>
            ))}
          </ul>
          <p className="checklist-diagnosis-note">開業予定日までの日数と、まだの項目から出しています（AIは使っていません）。</p>
        </section>
      )}

      {nextItem ? (
        <section className="checklist-next" aria-labelledby="checklist-next-heading">
          <p className="checklist-next-label" id="checklist-next-heading">
            次にやること
            <span className="checklist-next-stage">{nextItem.stageName}</span>
          </p>
          <p className="checklist-next-title">{nextItem.title}</p>
          <p className="checklist-next-text">{nextItem.text}</p>
          <div className="checklist-next-actions">
            {nextItem.id === COST_ITEM_ID && (
              <button type="button" className="checklist-link" onClick={openSimulator}>
                シミュレーターで計算する
              </button>
            )}
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
            <p className="checklist-next-text">おつかれさまでした。開店してから困ったときは、記事やAI無料POSレジ診断も使ってください。</p>
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
                      {item.id === COST_ITEM_ID && (
                        <>
                          <button
                            type="button"
                            className="checklist-sim-toggle"
                            aria-expanded={simOpen}
                            onClick={() => setSimOpen((v) => !v)}
                          >
                            {simOpen ? '初期費用シミュレーターを閉じる' : '初期費用シミュレーターを開く'}
                          </button>
                          {simOpen && ready && renderSimulator()}
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>

      {consultAvailable && (
        <section className="checklist-share checklist-consult" aria-labelledby="checklist-consult-heading">
          <h2 id="checklist-consult-heading">AI無料POSレジ診断（無料）</h2>
          <p>
            今の進み具合・まだの項目・シミュレーターの合計を、相談文にしてコピーします。AI無料POSレジ診断のフォームの相談内容に貼り付けて、相談したいことを書き足してください。AIが作った回答を運営者が確かめてから、メールでお返しします。
          </p>
          <p className="checklist-share-note">相談文に、名前・住所・電話番号などは入れないでください。</p>
          <div className="checklist-consult-actions">
            <button type="button" className="checklist-share-button" onClick={copyConsultText}>
              相談文をコピー
            </button>
            <Link href="/consult" className="checklist-link">
              AI無料POSレジ診断を開く
            </Link>
          </div>
          {consultFallback && (
            <label className="checklist-share-fallback">
              自動でコピーできませんでした。下の相談文を選んでコピーしてください。
              <textarea readOnly rows={8} value={consultFallback} onFocus={(e) => e.target.select()} />
            </label>
          )}
        </section>
      )}

      <section className="checklist-share" aria-labelledby="checklist-share-heading">
        <h2 id="checklist-share-heading">ほかの端末で続ける</h2>
        <p>
          チェックの状態・開業予定日・シミュレーターの金額は、このブラウザの中だけに保存します。サーバーには送りません。スマホとパソコンなど、ほかの端末で続けるときは、引き継ぎ用のURLをコピーして、その端末で開いてください。
        </p>
        <p className="checklist-share-note">URLには入力した内容が入っています。ほかの人には送らないでください。</p>
        <button type="button" className="checklist-share-button" onClick={copyShareUrl}>
          引き継ぎ用のURLをコピー
        </button>
        {shareFallback && (
          <label className="checklist-share-fallback">
            自動でコピーできませんでした。下のURLを選んでコピーしてください。
            <input type="text" readOnly value={shareFallback} onFocus={(e) => e.target.select()} />
          </label>
        )}
      </section>

      {doneCount > 0 && (
        <div className="checklist-footer">
          <button type="button" className="checklist-reset" onClick={resetAll}>
            最初からやり直す
          </button>
        </div>
      )}

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
