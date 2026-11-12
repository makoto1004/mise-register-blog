import Link from 'next/link';
import { JOURNEY_STEPS } from '@/lib/journey';

// 開業準備の道のり（1→4）の並び。current を渡すと、その番号に aria-current="step" を付ける
export default function JourneySteps({ current }) {
  return (
    <ol className="journey-steps" aria-label="開業準備の道のり">
      {JOURNEY_STEPS.map((step) => (
        <li key={step.id} className="journey-step" aria-current={step.id === current ? 'step' : undefined}>
          <Link href={step.path} className="journey-step-link">
            <span className="journey-step-number" aria-hidden="true">
              {step.number}
            </span>
            <span className="journey-step-body">
              <span className="journey-step-name">{step.name}</span>
              <span className="journey-step-lead">{step.lead}</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}