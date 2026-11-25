'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DIAGNOSIS_QUESTIONS, diagnosePos } from '@/lib/posDiagnosis';
import { CONSULT_AVAILABLE } from '@/lib/site';

// 結果の見出しと、診断結果のキーの対応
const RESULT_GROUPS = [
  { key: 'choose', heading: 'POS レジの選び方' },
  { key: 'devices', heading: 'そろえる周辺機器' },
  { key: 'setup', heading: 'つなぎ方の注意' },
];

// 3つの質問に答えると合う記事を案内する。答えはこの画面の state だけに持ち、どこにも送らない
// worksheet：結果の最後に案内する運営者のテンプレート（{ name, price }）
export default function PosDiagnosis({ posts, worksheet }) {
  const [answers, setAnswers] = useState({});
  // null: まだ押していない / 'missing': 未選択あり / 'done': 結果を表示
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const published = new Set(posts.map((post) => post.slug));
  const titleBySlug = new Map(posts.map((post) => [post.slug, post.title]));

  // 読み込みが終わる（JavaScript が動く）まではボタンを押せないようにする
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function selectAnswer(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    // 答えを変えたら、前の結果とメッセージは消す
    setStatus(null);
    setResult(null);
  }

  function handleSubmit() {
    const found = diagnosePos(answers, published);
    if (!found) {
      setResult(null);
      setStatus('missing');
      return;
    }
    setResult(found);
    setStatus('done');
  }

  return (
    <section className="pos-diagnosis" aria-labelledby="pos-diagnosis-heading">
      <h2 id="pos-diagnosis-heading" className="pos-diagnosis-title">3つの質問でレジを探す</h2>
      <p className="pos-diagnosis-note">その場で結果が出ます。答えはどこにも送りません。</p>
      {/* form は使わない（読み込み前に送信されて、答えが URL やアクセス記録に残るのを防ぐため） */}
      <noscript>
        <p className="pos-diagnosis-note">診断には JavaScript が必要です。下の記事の一覧をお使いください。</p>
      </noscript>
      <div>
        {DIAGNOSIS_QUESTIONS.map((question) => (
          <fieldset key={question.id} className="pos-diagnosis-group">
            <legend>{question.label}</legend>
            {question.options.map((option) => (
              <label key={option.value} className="pos-diagnosis-option">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={answers[question.id] === option.value}
                  onChange={() => selectAnswer(question.id, option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>
        ))}
        <button type="button" className="pos-diagnosis-button" onClick={handleSubmit} disabled={!mounted}>
          探す
        </button>
      </div>

      <div className="pos-diagnosis-result" aria-live="polite">
        {status === 'missing' && <p className="pos-diagnosis-error">3つとも選んでください</p>}
        {status === 'done' && result && (
          <>
            {result.candidates.length > 0 && (
              <div className="pos-diagnosis-result-group pos-diagnosis-candidates">
                <h3>まず比べたい候補</h3>
                <ul>
                  {result.candidates.map((c) => (
                    <li key={c.name}>
                      <strong>{c.name}</strong>：{c.reason}
                    </li>
                  ))}
                </ul>
                <p className="pos-diagnosis-note">料金と機能は変わります。決める前に公式で確かめてください。</p>
              </div>
            )}
            {RESULT_GROUPS.map((group) =>
              result[group.key].length > 0 ? (
                <div key={group.key} className="pos-diagnosis-result-group">
                  <h3>{group.heading}</h3>
                  <ul>
                    {result[group.key].map((slug) => (
                      <li key={slug}>
                        <Link href={`/posts/${slug}`}>{titleBySlug.get(slug)}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            )}
            {!result.fallbackToConsult && (
              <div className="pos-diagnosis-result-group">
                <h3>次にすること</h3>
                <ul>
                  {published.has('pos-cost-guide-2026') && (
                    <li>
                      <Link href="/posts/pos-cost-guide-2026">費用を表で比べる</Link>
                    </li>
                  )}
                  {CONSULT_AVAILABLE && (
                    <li>
                      まだ迷うなら <Link href="/consult">AI無料POSレジ診断</Link>（無料・メールで回答）
                    </li>
                  )}
                  {worksheet && (
                    <li>
                      自分で比べるなら <Link href="/templates">{worksheet.name}</Link>（運営者の有料テンプレート・{worksheet.price}）
                    </li>
                  )}
                </ul>
              </div>
            )}
            {result.fallbackToConsult && (
              <p className="pos-diagnosis-consult">
                {/* 診断の受付を始めるまでは、押すと「準備中」になるリンクを出さず、言葉で探す案内にする */}
                {CONSULT_AVAILABLE ? (
                  <>合う記事がまだありません。<Link href="/consult">AI無料POSレジ診断</Link></>
                ) : (
                  <>合う記事がまだありません。答えを変えるか、<Link href="/search">記事を探す</Link>から言葉で探してください。</>
                )}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
