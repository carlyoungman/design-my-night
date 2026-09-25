import React, { useMemo } from 'react';
import { useWidgetState } from '@app/WidgetProvider';
import { stepStatuses } from '@app/utils/steps';

/**
 * Booking progress. The compact version is used for the sticky bar on small screens and is
 * hidden from assistive technology, which gets the full version in the side panel instead.
 */
export default function ProgressBar({ compact = false }: { compact?: boolean }) {
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
    </section>
  );
}
