'use client';

import { useState } from 'react';
import { sendGAEvent } from '@next/third-parties/google';

// 簡易アンケート。回答は Google アナリティクスのイベント（survey_answer）として記録する
// 個人情報は集めない。Google アナリティクスが読み込まれていない場合は、表示だけで記録はされない
const QUESTIONS = [
  { id: 'helpful', label: 'この記事は役に立ちましたか？', options: ['役に立った', 'ふつう', '物足りない'] },
  { id: 'stage', label: 'あなたのお店の状況は？', options: ['開業準備中', 'すでに営業中', '情報収集中'] },
];

export default function QuickSurvey({ slug }) {
  const [answers, setAnswers] = useState({});

  const answer = (question, option) => {
    if (answers[question]) return;
    setAnswers((prev) => ({ ...prev, [question]: option }));
    try {
      sendGAEvent('event', 'survey_answer', { survey_question: question, survey_answer: option, article: slug });
    } catch {
      // Google アナリティクスが無効でも、画面の動きは止めない
    }
  };

  return (
    <section className="quick-survey" aria-labelledby="survey-title">
      <h2 id="survey-title">かんたんアンケート</h2>
      {QUESTIONS.map((q) => (
        <div key={q.id} className="survey-q">
          <p>{q.label}</p>
          <div className="survey-options">
            {q.options.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={answers[q.id] === option}
                disabled={Boolean(answers[q.id])}
                onClick={() => answer(q.id, option)}
              >
                {option}
              </button>
            ))}
          </div>
          {answers[q.id] && <p className="survey-thanks">ご回答ありがとうございます。</p>}
        </div>
      ))}
      <p className="survey-note">
        回答は、記事の改善のためにアクセス解析（Google アナリティクス）で集計します。お名前などの個人情報は集めません。
      </p>
    </section>
  );
}
