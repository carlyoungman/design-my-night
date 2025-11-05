import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { checkAvailability } from '../../../api/public';
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import LoadingAnimation from '../LoadingAnimation';
import { scrollToSection } from '../../utils/scroll';

type SuggestedTime = { iso: string; label: string };

export function Time() {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();

  const [loading, setLoading] = useState(false);
  const [times, setTimes] = useState<SuggestedTime[]>([]);

  // Convert whatever DMN returns into a consistent { iso, label } pair
  const parseTimes = useCallback((res: any): SuggestedTime[] => {
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
  }, []);

  useEffect(() => {
    if (!state.venueId || state.partySize == null || !state.date || !state.bookingType) {
      setTimes([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await checkAvailability(
          {
            venue_id: state.venueId!,
            ...(state.partySize != null ? { num_people: state.partySize } : {}),
            ...(state.date ? { date: state.date } : {}),
            ...(state.bookingType
              ? { activity_id: state.bookingType, type: state.bookingType }
              : {}),
          },
          'time',
        );

        if (cancelled) return;
        const parsed = parseTimes(res);
        setTimes(parsed);
      } catch {
        if (!cancelled) {
          setTimes([]);
          // dispatch({
          //   type: 'ERROR',
          //   message: 'Unable to load available times. Please adjust date or party size.',
          // });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.venueId, state.partySize, state.date, state.bookingType, dispatch, parseTimes]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_TIME', value: e.target.value });
    scrollToSection('section.details', { offset: { mobile: 190, desktop: 200 }, delay: 400 });
  };

  return (
    <section className="time">
      {loading && (
        <LoadingAnimation type="loading" text="Checking availability…"></LoadingAnimation>
      )}
      {!loading && times.length === 0 && (
        <LoadingAnimation type="required" text="Venue, party size, date and experience required" />
      )}
      {!loading && times.length > 0 && (
        <FormControl component="fieldset" variant="standard" className="time">
          <RadioGroup
            aria-label="Available times"
            name="available-times"
            value={state.time || ''}
            onChange={handleChange}
            className="time__radio-group"
          >
            {times.map((t) => (
              <FormControlLabel
                key={t.iso}
                value={t.iso}
                control={<Radio />}
                label={t.label}
                className="time__radio-label"
              />
            ))}
          </RadioGroup>
        </FormControl>
      )}
    </section>
  );
}
