import { AvailabilityReq, checkAvailability } from '../../api/public';
import { useWidgetDispatch, useWidgetState } from '../WidgetProvider';

function nearestQuarterTimes(baseHHmm: string, count = 3): string[] {
  const [h, m] = baseHHmm.split(':').map(Number);
  const mins = h * 60 + m;
  const candidates = [15, -15, 30, -30, 45, -45]
    .map((offset) => mins + offset)
    .filter((v) => v >= 0 && v < 24 * 60);
  const dedup = new Set<string>();
  for (const c of candidates) {
    const hh = String(Math.floor(c / 60)).padStart(2, '0');
    const mm = String(c % 60).padStart(2, '0');
    dedup.add(`${hh}:${mm}`);
    if (dedup.size >= count) break;
  }
  return Array.from(dedup);
}

type UnknownRecord = Record<string, unknown>;
function getSuggestedTimes(validation: unknown): string[] {
  if (!validation || typeof validation !== 'object') return [];
  const v = validation as UnknownRecord;
  const tryKey = (key: string): string[] => {
    const node = v[key];
    if (node && typeof node === 'object') {
      const sv = (node as { suggestedValues?: unknown }).suggestedValues;
      if (Array.isArray(sv) && sv.every((x) => typeof x === 'string')) return sv;
    }
    return [];
  };
  return tryKey('time').length ? tryKey('time') : tryKey('booking_time');
}

export function useAvailability() {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();

  async function runAvailability(opts: { includeTime?: boolean } = {}) {
    if (!state.venueId || !state.partySize || !state.date) {
      dispatch({ type: 'ERROR', message: 'Please choose venue, guests and date first.' });
      return;
    }
    if (!state.bookingType) {
      dispatch({ type: 'ERROR', message: 'Please choose an experience.' });
      return;
    }
    dispatch({ type: 'ERROR', message: null });

    const payload: AvailabilityReq = {
      venue_id: state.venueId,
      num_people: state.partySize,
      date: state.date,
      ...(state.bookingType ? { type: state.bookingType } : {}),
      ...(opts.includeTime && state.time ? { time: state.time } : {}),
    };

    const r = await checkAvailability(payload);
    const valid = !!r?.payload?.valid;
    const action = r?.payload?.action as any;
    const nextWeb = r?.payload?.next?.web as string | undefined;
    const suggested = getSuggestedTimes(r?.payload?.validation);

    dispatch({ type: 'SET_AVAIL', value: { valid, action, nextWeb: nextWeb || null } });

    if (!valid && state.time) {
      const fallback = suggested.length
        ? suggested.slice(0, 3)
        : nearestQuarterTimes(state.time, 3);
      dispatch({ type: 'SET_SUGGESTIONS', value: fallback });
    } else {
      dispatch({ type: 'SET_SUGGESTIONS', value: [] });
    }
    return { valid, action, nextWeb, suggested };
  }

  return { runAvailability };
}
