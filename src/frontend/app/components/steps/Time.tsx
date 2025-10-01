import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { checkAvailability } from '../../../api/public';
import { FormControl, FormControlLabel, RadioGroup, Radio } from '@mui/material';
import LoadingAnimation from '../LoadingAnimation';
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

  // Fetch "fields=time" whenever required inputs exist.
  // (We don't gate on state.step—this prefetches after date pick so the list is ready.)
  useEffect(() => {
    if (!state.venueId || state.partySize == null || !state.date) {
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
          },
          'time',
        );

        if (cancelled) return;
        const parsed = parseTimes(res);
        setTimes(parsed);

        // Surface a short list of suggestions into global state (chips, etc.)
        const top3 = parsed.slice(0, 3).map((t) => t.label);
        dispatch({ type: 'SET_SUGGESTIONS', value: top3 });
      } catch {
        if (!cancelled) {
          setTimes([]);
          dispatch({
            type: 'ERROR',
            message: 'Unable to load available times. Please adjust date or party size.',
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.venueId, state.partySize, state.date, dispatch, parseTimes]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_TIME', value: e.target.value });
  };

  return (
    <section className="time">
      {loading && <LoadingAnimation text="Checking availability…"></LoadingAnimation>}
      {!loading && times.length === 0 && (
        <LoadingAnimation text="Venue, party size and date required" />
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
