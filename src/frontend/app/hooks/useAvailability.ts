import { checkAvailability } from '../../api/public';

import { useWidgetDispatch, useWidgetState } from '../WidgetProvider';
import type { AvailabilityReq } from '../../api/public';
/**
 * useAvailability
 * - Centralises availability checks against DMN
 * - Uses DMN's validation.suggestedValues for time fallbacks (recommended)
 * - Returns the raw API response so callers (e.g., Review step) can inspect next.web
 */
export function useAvailability() {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();

  async function runAvailability(
    opts: { includeTime?: boolean; field?: 'type' | 'date' | 'time' } = {},
  ) {
    // Basic guardrails: require venue + party size at minimum; if we're checking time, also require date
    if (!state.venueId || !state.partySize) {
      dispatch({ type: 'ERROR', message: 'Please choose venue and guests first.' });
      return null;
    }
    if ((opts.includeTime || opts.field === 'time') && !state.date) {
      dispatch({ type: 'ERROR', message: 'Please choose a date first.' });
      return null;
    }

    // Build payload with only known fields (faster + doc‑recommended)
    const payload: AvailabilityReq = {
      venue_id: state.venueId,
      ...(state.partySize ? { num_people: state.partySize } : {}),
      ...(state.bookingType ? { type: state.bookingType } : {}),
      ...(state.date ? { date: state.date } : {}),
      ...(opts.includeTime && state.time ? { time: state.time } : {}),
    } as AvailabilityReq;

    try {
      const res = await checkAvailability(payload, opts.field);

      const valid = Boolean(res?.payload?.valid);
      const action = res?.payload?.action ?? null;
      const nextWeb = res?.payload?.next?.web ?? null;

      // Pull API‑driven suggestions for time (recommended by DMN docs)
      const timeSv = (res?.payload?.validation?.time?.suggestedValues ?? []) as Array<{
        value?: string;
        valid?: boolean;
      }>;
      const apiSuggestions = timeSv
        .filter((s) => s?.valid && typeof s?.value === 'string')
        .map((s) => s.value as string)
        .slice(0, 3);

      // Update global state
      dispatch({ type: 'SET_SUGGESTIONS', value: apiSuggestions });
      dispatch({
        type: 'SET_AVAIL',
        value: { valid, action, nextWeb },
      });

      // Clear any previous error
      dispatch({ type: 'ERROR', message: null });

      return res; // allow callers to inspect next, validation, etc.
    } catch (e: any) {
      dispatch({ type: 'ERROR', message: e?.message || 'Availability check failed.' });
      return null;
    }
  }

  return { runAvailability };
}
