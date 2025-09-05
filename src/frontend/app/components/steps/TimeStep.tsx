import React, { useEffect, useState } from 'react';
import { StepShell } from '../StepShell';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';

type Json = Record<string, any>;
type TimeOption = { time: string; action?: string | null; message?: string | null };

const getValidTimes = (v: Json | null): TimeOption[] => {
  const sv = v?.time?.suggestedValues ?? [];
  if (!Array.isArray(sv)) return [];
  return (
    sv
      .map((t) => {
        if (t && typeof t === 'object' && typeof t.time === 'string') {
          return {
            time: t.time,
            action: t.action ?? null,
            message: t.message ?? null,
            valid: t.valid ?? true,
          } as any;
        }
        if (typeof t === 'string') {
          return { time: t, action: null, message: null, valid: true } as any;
        }
        return null;
      })
      .filter(Boolean)
      // ✅ only keep valid=true
      .filter((t: any) => t.valid === true)
      // strip the internal valid now we’ve filtered
      .map(({ time, action, message }) => ({ time, action, message }))
  );
};

export function TimeStep() {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();
  const [times, setTimes] = useState<TimeOption[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchValidation(opts: { includeTime?: boolean } = {}) {
    if (!state.venueId || !state.partySize || !state.date || !state.bookingType) return;
    setLoading(true);
    try {
      const resp = await fetch('/wp-json/dmn/v1/booking-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue_id: state.venueId,
          num_people: state.partySize,
          date: state.date,
          type: state.bookingType,
          ...(opts.includeTime && state.time ? { time: state.time } : {}),
        }),
      });
      const json: Json = await resp.json();
      const payload = json?.payload ?? json?.data?.payload ?? json ?? {};
      const validation = payload?.validation ?? null;

      // 🔹 only valid:true time options
      const validTimes = getValidTimes(validation);
      setTimes(validTimes);

      // keep a short suggestions list in state (strings only) if you still use it elsewhere
      dispatch({ type: 'SET_SUGGESTIONS', value: validTimes.slice(0, 3).map((t) => t.time) });

      // if we included a time, update availability and advance only if valid
      if (opts.includeTime) {
        const valid = !!payload?.valid;
        dispatch({
          type: 'SET_AVAIL',
          value: { valid, action: payload?.action, nextWeb: payload?.next?.web ?? null },
        });
        if (valid /* && state.durationMinutes != null */) {
          dispatch({ type: 'NEXT' });
        }
      }
    } finally {
      setLoading(false);
    }
  }

  // initial load (no time) to populate valid suggestions and show any first error
  useEffect(() => {
    if (state.step === 'time') fetchValidation();
  }, [state.step, state.venueId, state.date, state.partySize, state.bookingType]);

  return (
    <StepShell className="time">
      <p className="step__label">Select a time?</p>
      {loading && <p>Loading times…</p>}
      {!loading && (
        <>
          {/* 2-column grid of ONLY valid times */}
          <div className="dmn-widget__time-grid" role="group" aria-label="Suggested times">
            {times.map((t) => (
              <button
                key={t.time}
                type="button"
                className={`dmn-widget__time-btn${state.time === t.time ? ' is-selected' : ''}`}
                onClick={async () => {
                  dispatch({ type: 'SET_TIME', value: t.time });
                  await fetchValidation({ includeTime: true });
                }}
                title={t.action ? `Action: ${t.action}` : undefined}
              >
                {t.time}
                {/* Optional tiny chip for action */}
                {t.action && (
                  <span className="dmn-chip" style={{ marginLeft: 6 }}>
                    {t.action}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </StepShell>
  );
}
