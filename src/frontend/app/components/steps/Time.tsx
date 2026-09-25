import React, { useCallback, useEffect, useState } from 'react';
import { Radio } from '@base-ui-components/react/radio';
import { RadioGroup } from '@base-ui-components/react/radio-group';
import { useWidgetDispatch, useWidgetState } from '@app/WidgetProvider';
import { checkAvailability } from '@api/public';
import LoadingAnimation from '@app/components/LoadingAnimation';
import { StepPrerequisite } from '@app/components/StepPrerequisite';
import { StateMessage } from '@app/components/StateMessage';
import { scrollToSection } from '@app/utils/scroll';

type SuggestedTime = { iso: string; label: string };

// Convert whatever DMN returns into a consistent { iso, label } pair
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTimes(res: any): SuggestedTime[] {
  const v =
    res?.payload?.validation?.time ??
    res?.data?.payload?.validation?.time ??
    res?.data?.validation?.time ??
    res?.validation?.time ??
    null;

  const sv = Array.isArray(v?.suggestedValues) ? v.suggestedValues : [];
  const out: SuggestedTime[] = [];

  for (const item of sv) {
    if (item?.valid !== true) continue;
    const raw = item?.time ?? item?.value ?? item;
    if (!raw) continue;

    const iso = typeof raw === 'string' ? raw : String(raw);
    const m = /\d{2}:\d{2}/.exec(iso);
    const label = m ? m[0] : iso;

    out.push({ iso, label });
  }
  return out;
}

export function Time({ labelledBy }: { labelledBy: string }) {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [times, setTimes] = useState<SuggestedTime[]>([]);
  const [attempt, setAttempt] = useState(0);

  const ready = !!state.venueId && state.partySize != null && !!state.date && !!state.bookingType;

  useEffect(() => {
    if (!ready) {
      setTimes([]);
      setLoaded(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await checkAvailability(
          {
            venue_id: state.venueId!,
            num_people: state.partySize!,
            date: state.date!,
            ...{ activity_id: state.bookingType!, type: state.bookingType! },
          },
          'time',
        );

        if (cancelled) return;
        setTimes(parseTimes(res));
      } catch {
        if (!cancelled) {
          setTimes([]);
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, state.venueId, state.partySize, state.date, state.bookingType, attempt]);

  const handleChange = useCallback(
    (value: unknown) => {
      dispatch({ type: 'SET_TIME', value: String(value) });
      scrollToSection('section[data-step="details"]', {
        offset: { mobile: 190, desktop: 200 },
        delay: 400,
      });
    },
    [dispatch],
  );

  if (!ready) {
    return <StepPrerequisite requires={['venue', 'partySize', 'date', 'experience']} />;
  }

  return (
    <div className="time">
      {loading && <LoadingAnimation text="Checking available times…" />}
      {!loading && error && (
        <StateMessage kind="error" onAction={() => setAttempt((n) => n + 1)}>
          We couldn’t load available times.
        </StateMessage>
      )}
      {!loading && !error && loaded && times.length === 0 && (
        <StateMessage kind="empty">
          No times are left for this experience on this date. Choose another date or experience.
        </StateMessage>
      )}
      {!loading && !error && times.length > 0 && (
        <RadioGroup
          aria-labelledby={labelledBy}
          value={state.time || ''}
          onValueChange={handleChange}
          className="time__options"
        >
          {times.map((t) => (
            <Radio.Root key={t.iso} value={t.iso} className="time__option">
              {t.label}
            </Radio.Root>
          ))}
        </RadioGroup>
      )}
    </div>
  );
}
