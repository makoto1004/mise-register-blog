'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DIAGNOSIS_QUESTIONS, diagnosePos } from '@/lib/posDiagnosis';

// 結果の見出しと、診断結果のキーの対応
const RESULT_GROUPS = [
  { key: 'choose', heading: 'POS レジの選び方' },
  { key: 'devices', heading: 'そろえる周辺機器' },
  { key: 'setup', heading: 'つなぎ方の注意' },
];

// 3つの質問に答えると合う記事を案内する。答えはこの画面の state だけに持ち、どこにも送らない
export default function PosDiagnosis({ posts }) {
  const [answers, setAnswers] = useState({});
  // null: まだ押していない / 'missing': 未選択あり / 'done': 結果を表示
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const titleBySlug = new Map(posts.map((post) => [post.slug, post.title]));

  function selectAnswer(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const found = diagnosePos(answers, new Set(posts.map((post) => post.slug)));
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
      <h2 id="pos-diagnosis-heading" className="pos-diagnosis-title">3つの質問で、合う記事を探す</h2>
      <p className="pos-diagnosis-note">答えはこの画面の中だけで使い、どこにも送りません。</p>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" className="pos-diagnosis-button">合う記事を探す</button>
      </form>

      <div className="pos-diagnosis-result" aria-live="polite">
        {status === 'missing' && <p className="pos-diagnosis-error">3つとも選んでください</p>}
        {status === 'done' && result && (
          <>
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
            {result.fallbackToConsult && (
              <p className="pos-diagnosis-consult">
                合う記事がまだありません。<Link href="/consult">AI に相談する</Link>と、お店に合う選び方を一緒に考えます。
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
