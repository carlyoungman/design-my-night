import React, { useMemo } from 'react';
import { CheckCircle2, Circle, CircleDot } from 'lucide-react';
import { useWidgetState } from '@app/WidgetProvider';
import { stepStatuses } from '@app/utils/steps';

const STATUS_TEXT = { done: 'complete', current: 'current step', todo: 'not started' } as const;

/**
 * Booking progress. `showSteps` adds the list of step labels with their status; the compact
 * version (bar only) is used for the sticky bar on small screens and is hidden from assistive
 * technology, which gets the full version in the side panel instead.
 */
export default function ProgressBar({
  showSteps = false,
  compact = false,
}: {
  showSteps?: boolean;
  compact?: boolean;
}) {
  const state = useWidgetState();

  const steps = useMemo(() => stepStatuses(state), [state]);
  const completed = steps.filter((s) => s.status === 'done').length;
  const total = steps.length;
  const percent = Math.round((completed / total) * 100);

  return (
    <section
      className="progress-bar"
      aria-label={compact ? undefined : 'Booking progress'}
      aria-hidden={compact || undefined}
    >
      <p className="progress-bar__text">
        {completed} of {total} steps complete
      </p>
      <div
        className="progress-bar__bar"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuetext={`${completed} of ${total} steps complete`}
        aria-label="Booking progress"
      >
        <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
      </div>
      {showSteps && (
        <ol className="progress-bar__steps">
          {steps.map((s) => (
            <li
              key={s.key}
              className={`progress-bar__step progress-bar__step--${s.status}`}
              aria-current={s.status === 'current' ? 'step' : undefined}
            >
              {s.status === 'done' ? (
                <CheckCircle2 />
              ) : s.status === 'current' ? (
                <CircleDot />
              ) : (
                <Circle />
              )}
              <span>
                {s.label}
                <span className="screen-reader-text">, {STATUS_TEXT[s.status]}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
