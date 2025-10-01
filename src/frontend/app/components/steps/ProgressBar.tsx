import React, { useMemo } from 'react';
import { useWidgetState } from '../../WidgetProvider';

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());
}

export default function ProgressBar() {
  const state = useWidgetState();

  const { completed, total, percent } = useMemo(() => {
    const partyDone = (state.partySize ?? 0) >= 1;

    const venueDone = !!state.venueId;

    const dateDone = venueDone && !!state.date;

    const timeDone = dateDone && !!state.time;

    const typeDone = timeDone && !!state.bookingType;

    // Add-ons are optional. Count as done when the step is reachable.
    const addonsDone = typeDone;

    const c = state.customer || ({} as typeof state.customer);
    const detailsDone =
      c &&
      (c.first_name || '').trim().length >= 2 &&
      (c.last_name || '').trim().length >= 2 &&
      isEmail(c.email || '') &&
      (!(c.phone || '').trim() || /^[\d\s()+-]{6,20}$/.test((c.phone || '').trim())) &&
      (c.message || '').length <= 500;

    const steps = [partyDone, venueDone, dateDone, timeDone, typeDone, addonsDone, detailsDone];

    const done = steps.filter(Boolean).length;
    const total = steps.length;
    const percent = Math.round((done / total) * 100);
    return { completed: done, total, percent };
  }, [state]);

  return (
    <section className="progress-bar" role="group" aria-label="Booking progress">
      <div
        className="progress-bar__bar"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${completed} of ${total} steps complete`}
      >
        <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="progress-bar__text">
        {completed} of {total} steps complete
      </div>
    </section>
  );
}
