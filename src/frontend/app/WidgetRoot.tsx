import * as React from 'react';
import { useEffect, useReducer, useState } from 'react';
import { initialState, reducer } from './state';
import { AvailabilityReq, checkAvailability, getVenues } from '../api/public';

// Optional helpers if you add them to ../api/public later:
// import { getPackages, createBooking, getBookingTypes } from '../api/public';

type RootProps = {
  venueGroup?: string;
  forcedVenueId?: string;
  corpThreshold?: number;
  corpEnquiryUrl?: string;
  returnUrl?: string;
};

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;
const todayISO = () => new Date().toISOString().slice(0, 10);
const sixMonthsISO = () => new Date(Date.now() + SIX_MONTHS_MS).toISOString().slice(0, 10);

// Fallback time suggestion generator (if API doesn't give suggestions)
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

  // DMN commonly uses either "time" or "booking_time"
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

export default function WidgetRoot({
  venueGroup,
  forcedVenueId,
  corpThreshold = 20,
  corpEnquiryUrl,
  returnUrl,
}: RootProps) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    step: forcedVenueId ? 'stage1' : 'venue',
    venueId: forcedVenueId ?? null,
  });

  // ========= Venues (only when not forced) =========
  const [venues, setVenues] = useState<
    Array<{ title: string; _id: string; name?: string; path: string }>
  >([]);
  const [vLoading, setVLoading] = useState(false);
  const [vErr, setVErr] = useState<string | null>(null);

  useEffect(() => {
    if (forcedVenueId) return;
    (async () => {
      try {
        setVLoading(true);
        setVErr(null);
        const res = await getVenues({ venue_group: venueGroup, fields: 'path,name,title' });
        setVenues(res.data.payload?.pages || []);
      } catch (e: any) {
        setVErr(e?.message || 'Failed to load venues');
      } finally {
        setVLoading(false);
      }
    })();
  }, [venueGroup, forcedVenueId]);

  // ========= Booking Types (Experience) =========
  const [types, setTypes] = useState<
    Array<{ id: string; name: string; description?: string; priceText?: string }>
  >([]);
  const [typesLoading, setTypesLoading] = useState(false);

  async function loadTypes() {
    if (!state.venueId || !state.date || !state.partySize) return;
    try {
      setTypesLoading(true);

      // 1) try WP-configured types first (keeps friendly names if you have them)
      const res = await fetch(
        `/wp-json/dmn/v1/booking-types?venue_id=${encodeURIComponent(state.venueId)}`,
      );
      const json = await res.json();
      const configured = Array.isArray(json?.data) ? json.data : [];
      if (configured.length > 0) {
        setTypes(
          configured.map((t: any) => ({
            id: String(t.id),
            name: t.name || String(t.id),
            description: t.description || '',
            priceText: t.priceText || '',
          })),
        );
        return;
      }

      // 2) fallback: ask availability WITHOUT a type to get DMN’s suggestions
      const avRes = await fetch(`/wp-json/dmn/v1/booking-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue_id: state.venueId,
          num_people: state.partySize,
          date: state.date,
          // no type here on purpose
        }),
      });
      const avJson = await avRes.json();

      // Handles both shapes:
      // - suggestedValues: string[]
      // - suggestedValues: { value: { id, name, ... }, valid, ... }[]
      const rawSuggested =
        avJson?.validation?.type?.suggestedValues ??
        avJson?.data?.payload?.validation?.type?.suggestedValues ??
        [];

      const suggestedTypes = (Array.isArray(rawSuggested) ? rawSuggested : [])
        .map((item: any) => {
          const v = item && typeof item === 'object' && 'value' in item ? item.value : item;
          return v && typeof v === 'object'
            ? { id: String(v.id), name: v.name || String(v.id) }
            : typeof v === 'string'
              ? { id: v, name: v }
              : null;
        })
        .filter(Boolean) as Array<{ id: string; name: string }>;

      // de-dupe by id and set
      const seen = new Set<string>();
      const finalTypes = suggestedTypes
        .filter((t) => {
          if (seen.has(t.id)) return false;
          seen.add(t.id);
          return true;
        })
        .map((t) => ({
          id: t.id,
          name: t.name,
          description: '', // optional: you can enrich later from WP
          priceText: '',
        }));

      setTypes(finalTypes);
    } catch {
      setTypes([]);
    } finally {
      setTypesLoading(false);
    }
  }

  // When we arrive on the "type" step with base inputs ready, fetch types
  useEffect(() => {
    if (state.step === 'type') loadTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, state.venueId, state.date, state.partySize]);

  // ========= Packages (per venue) =========
  const [pkLoading, setPkLoading] = useState(false);

  async function loadPackages() {
    if (!state.venueId) return;
    try {
      setPkLoading(true);
      const res = await fetch(
        `/wp-json/dmn/v1/packages?venue_id=${encodeURIComponent(state.venueId)}`,
      );
      const json = await res.json();
      dispatch({ type: 'SET_PACKAGES', value: json?.data || [] });
    } catch {
      dispatch({ type: 'SET_PACKAGES', value: [] });
    } finally {
      setPkLoading(false);
    }
  }

  useEffect(() => {
    if (state.step === 'packages') loadPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, state.venueId]);

  // ========= Availability =========
  async function runAvailability(opts: { includeTime?: boolean } = {}) {
    if (!state.venueId || !state.partySize || !state.date) {
      dispatch({ type: 'ERROR', message: 'Please choose venue, guests and date first.' });
      return;
    }
    if (!state.bookingType) {
      // Type is mandatory at many venues
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
      // getOffers?: true // optional if you want offers surfaced here
    };
    const r = await checkAvailability(payload);
    const valid = !!r?.payload?.valid;
    const action = r?.payload?.action as any;
    const nextWeb = r?.payload?.next?.web as string | undefined;

    // Extract suggested times from validation if present
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

  // ========= Corporate threshold guard =========
  useEffect(() => {
    if (state.step === 'stage1' && corpEnquiryUrl && state.partySize > (corpThreshold || 20)) {
      window.location.assign(corpEnquiryUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.partySize, state.step, corpThreshold, corpEnquiryUrl]);

  // Auto-continue when only one type exists
  useEffect(() => {
    if (state.step !== 'type' || !types.length) return;
    if (types.length === 1 && !state.bookingType) {
      dispatch({ type: 'SET_TYPE', value: types[0].id });
      (async () => {
        await runAvailability();
        dispatch({ type: 'NEXT' });
      })();
    }
  }, [state.step, types, state.bookingType]); // eslint-disable-line react-hooks/exhaustive-deps

  // ========= Review countdown =========
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (state.step !== 'review') return;
    const deadline = Date.now() + 10 * 60 * 1000; // 10 min
    dispatch({ type: 'START_REVIEW_TIMER', deadline });
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [state.step]);
  const remainingSec = Math.max(0, Math.floor(((state.reviewDeadline || 0) - now) / 1000));
  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const ss = String(remainingSec % 60).padStart(2, '0');
  const expired = remainingSec <= 0;

  // ========= Create booking then redirect =========
  async function onConfirm() {
    if (expired) {
      dispatch({ type: 'ERROR', message: 'Your selection expired. Please re-check availability.' });
      return;
    }
    if (!state.venueId || !state.partySize || !state.date || !state.time || !state.bookingType) {
      dispatch({ type: 'ERROR', message: 'Missing details. Please complete all steps.' });
      return;
    }

    // Build a custom_field_value string for accounting/reporting
    const packageLabels = state.packages
      .filter((p) => state.packagesSelected.includes(p.id))
      .map((p) => p.label)
      .join(', ');

    // Split customer name to DMN fields
    const [first_name, ...rest] = (state.customer.name || '').trim().split(/\s+/);
    const last_name = rest.join(' ');

    try {
      const resp = await fetch('/wp-json/dmn/v1/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue_id: state.venueId,
          type: state.bookingType,
          date: state.date,
          time: state.time,
          num_people: state.partySize,
          customer: {
            first_name,
            last_name,
            email: state.customer.email,
            phone: state.customer.phone,
          },
          // DMN supports both `package` and `custom_field_value` fields — use what your account maps
          package: packageLabels,
          custom_field_value: packageLabels,
          return_url: returnUrl, // DMN will redirect back with reference/status/etc.
        }),
      });
      const json = await resp.json();
      const nextWeb = json?.data?.next?.web || json?.next?.web; // support either shape
      if (nextWeb) {
        window.location.assign(nextWeb);
      } else {
        dispatch({ type: 'ERROR', message: 'Booking created but no redirect URL returned.' });
      }
    } catch (e: any) {
      dispatch({ type: 'ERROR', message: e?.message || 'Failed to create booking.' });
    }
  }

  return (
    <div className="dmn-widget" role="form" aria-labelledby="dmn-title">
      {state.error && (
        <p className="dmn-widget__error" role="alert">
          {state.error}
        </p>
      )}

      {/* ========== PRE: Venue (only for multi-venue) ========== */}
      {state.step === 'venue' && (
        <div className="dmn-widget__step">
          <h3 className="dmn-widget__title">Choose a venue</h3>
          {vLoading && <p>Loading venues…</p>}
          {vErr && <p className="dmn-widget__error">{vErr}</p>}
          {!vLoading && !vErr && (
            <div className="dmn-widget__field">
              <label className="dmn-widget__label">Venue</label>
              <select
                className="dmn-widget__select"
                value={state.venueId || ''}
                onChange={(e) => dispatch({ type: 'SET_VENUE', id: e.target.value || null })}
              >
                <option value="" disabled>
                  Choose…
                </option>
                {venues.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name || v.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="dmn-widget__actions">
            <button
              className="dmn-widget__btn"
              disabled={!state.venueId}
              onClick={() => dispatch({ type: 'NEXT' })}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ========== Stage 1: Guests + Date ========== */}
      {state.step === 'stage1' && (
        <div className="dmn-widget__step">
          <h3 className="dmn-widget__title">Guests & date</h3>
          <div className="dmn-widget__field">
            <label className="dmn-widget__label">Number of guests</label>
            <input
              className="dmn-widget__input"
              type="number"
              min={1}
              max={100}
              value={state.partySize}
              onChange={(e) => {
                const size = Math.max(1, Number(e.target.value || 1));
                dispatch({ type: 'SET_GUESTS_DATE', size, date: state.date || todayISO() });
              }}
            />
          </div>
          <div className="dmn-widget__field">
            <label className="dmn-widget__label">Date</label>
            <input
              className="dmn-widget__input"
              type="date"
              min={todayISO()}
              max={sixMonthsISO()}
              value={state.date || ''}
              onChange={(e) =>
                dispatch({ type: 'SET_GUESTS_DATE', size: state.partySize, date: e.target.value })
              }
            />
          </div>
          <div className="dmn-widget__hint">We’ll check availability next.</div>
          <div className="dmn-widget__actions">
            <button
              className="dmn-widget__btn dmn-widget__btn--ghost"
              onClick={() => dispatch({ type: 'BACK' })}
            >
              Back
            </button>
            <button
              className="dmn-widget__btn"
              disabled={!(state.venueId || forcedVenueId)}
              onClick={() => {
                if (!state.date) {
                  dispatch({ type: 'SET_GUESTS_DATE', size: state.partySize, date: todayISO() });
                }
                dispatch({ type: 'NEXT' });
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ========== Stage 2: Experience / Booking Type ========== */}
      {state.step === 'type' && (
        <div className="dmn-widget__step">
          <h3 className="dmn-widget__title">Choose an experience</h3>
          {typesLoading && <p>Loading experiences…</p>}
          {!typesLoading && (
            <div className="dmn-widget__field">
              {types.length === 0 && <p>No experiences configured.</p>}
              {types.map((t) => (
                <label key={t.id} className="dmn-widget__radio">
                  <input
                    type="radio"
                    name="bookingType"
                    value={t.id}
                    checked={state.bookingType === t.id}
                    onChange={() => dispatch({ type: 'SET_TYPE', value: t.id })}
                  />
                  <span className="dmn-widget__radio-label">
                    <strong>{t.name}</strong>
                    {t.priceText ? ` — ${t.priceText}` : ''}
                    {t.description ? <em> — {t.description}</em> : ''}
                  </span>
                </label>
              ))}
            </div>
          )}
          <div className="dmn-widget__actions">
            <button
              className="dmn-widget__btn dmn-widget__btn--ghost"
              onClick={() => dispatch({ type: 'BACK' })}
            >
              Back
            </button>
            <button
              className="dmn-widget__btn"
              disabled={!state.bookingType}
              onClick={() => {
                // Validate base inputs (venue + guests + date + type).
                runAvailability();
                dispatch({ type: 'NEXT' });
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ========== Stage 3: Time ========== */}
      {state.step === 'time' && (
        <div className="dmn-widget__step">
          <h3 className="dmn-widget__title">Choose a time</h3>
          <div className="dmn-widget__field">
            <label className="dmn-widget__label">Time</label>
            <input
              className="dmn-widget__input"
              type="time"
              step={900} // 15 min
              value={state.time || ''}
              onChange={(e) => dispatch({ type: 'SET_TIME', value: e.target.value })}
            />
          </div>
          <div className="dmn-widget__actions">
            <button
              className="dmn-widget__btn dmn-widget__btn--ghost"
              onClick={() => dispatch({ type: 'BACK' })}
            >
              Back
            </button>
            <button
              className="dmn-widget__btn"
              onClick={async () => {
                const r = await runAvailability({ includeTime: true });
                if (r?.valid) dispatch({ type: 'NEXT' });
              }}
            >
              Check availability
            </button>
          </div>

          {!!state.suggestions.length && (
            <div className="dmn-widget__hint">
              Not available then. Try:
              <div className="dmn-widget__chips">
                {state.suggestions.map((s) => (
                  <button
                    key={s}
                    className="dmn-widget__chip"
                    onClick={async () => {
                      dispatch({ type: 'SET_TIME', value: s });
                      const r = await runAvailability({ includeTime: true });
                      if (r?.valid) dispatch({ type: 'NEXT' });
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== Step: Packages ========== */}
      {state.step === 'packages' && (
        <div className="dmn-widget__step">
          <h3 className="dmn-widget__title">Add-on packages</h3>
          {pkLoading && <p>Loading packages…</p>}
          {!pkLoading && (
            <ul className="dmn-widget__list">
              {state.packages.map((p) => (
                <li key={p.id}>
                  <label className="dmn-widget__checkbox">
                    <input
                      type="checkbox"
                      checked={state.packagesSelected.includes(p.id)}
                      onChange={(e) => {
                        const next = new Set(state.packagesSelected);
                        e.target.checked ? next.add(p.id) : next.delete(p.id);
                        dispatch({ type: 'SET_PACKAGES_SELECTED', value: Array.from(next) });
                      }}
                    />
                    <span>{p.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <div className="dmn-widget__actions">
            <button
              className="dmn-widget__btn dmn-widget__btn--ghost"
              onClick={() => dispatch({ type: 'BACK' })}
            >
              Back
            </button>
            <button className="dmn-widget__btn" onClick={() => dispatch({ type: 'NEXT' })}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ========== Step: Customer Details ========== */}
      {state.step === 'details' && (
        <div className="dmn-widget__step">
          <h3 className="dmn-widget__title">Your details</h3>
          <div className="dmn-widget__field">
            <label className="dmn-widget__label">Name</label>
            <input
              className="dmn-widget__input"
              value={state.customer.name}
              onChange={(e) =>
                dispatch({
                  type: 'SET_CUSTOMER',
                  value: { ...state.customer, name: e.target.value },
                })
              }
            />
          </div>
          <div className="dmn-widget__field">
            <label className="dmn-widget__label">Email</label>
            <input
              className="dmn-widget__input"
              type="email"
              value={state.customer.email}
              onChange={(e) =>
                dispatch({
                  type: 'SET_CUSTOMER',
                  value: { ...state.customer, email: e.target.value },
                })
              }
            />
          </div>
          <div className="dmn-widget__field">
            <label className="dmn-widget__label">Phone (optional)</label>
            <input
              className="dmn-widget__input"
              value={state.customer.phone || ''}
              onChange={(e) =>
                dispatch({
                  type: 'SET_CUSTOMER',
                  value: { ...state.customer, phone: e.target.value },
                })
              }
            />
          </div>
          <div className="dmn-widget__field">
            <label className="dmn-widget__label">Message (optional)</label>
            <textarea
              className="dmn-widget__textarea"
              value={state.customer.message || ''}
              onChange={(e) =>
                dispatch({
                  type: 'SET_CUSTOMER',
                  value: { ...state.customer, message: e.target.value },
                })
              }
            />
          </div>
          <label className="dmn-widget__checkbox">
            <input
              type="checkbox"
              checked={!!state.customer.gdpr}
              onChange={(e) =>
                dispatch({
                  type: 'SET_CUSTOMER',
                  value: { ...state.customer, gdpr: e.target.checked },
                })
              }
            />
            <span>I agree to be contacted (GDPR).</span>
          </label>
          <div className="dmn-widget__actions">
            <button
              className="dmn-widget__btn dmn-widget__btn--ghost"
              onClick={() => dispatch({ type: 'BACK' })}
            >
              Back
            </button>
            <button className="dmn-widget__btn" onClick={() => dispatch({ type: 'NEXT' })}>
              Review
            </button>
          </div>
        </div>
      )}

      {/* ========== Step: Review (promo + FAQ + countdown) ========== */}
      {state.step === 'review' && (
        <div className="dmn-widget__step">
          <h3 className="dmn-widget__title">Review & confirm</h3>

          {/* Summary */}
          <ul className="dmn-widget__summary">
            <li>
              Venue: <code>{state.venueId}</code>
            </li>
            <li>Guests: {state.partySize}</li>
            <li>Date: {state.date}</li>
            <li>Time: {state.time}</li>
            <li>Experience: {state.bookingType}</li>
            <li>
              Packages:{' '}
              {state.packages
                .filter((p) => state.packagesSelected.includes(p.id))
                .map((p) => p.label)
                .join(', ') || 'None'}
            </li>
            <li>
              Name/Email: {state.customer.name} / {state.customer.email}
            </li>
          </ul>

          {/* Promo slider (simple manual) */}
          <div className="dmn-widget__promo">
            <div className="dmn-widget__promo-item">
              <img src="/path/to/promo1.jpg" alt="" />
              <div>
                <strong>Summer specials</strong> — Save 10% on midweek bookings
              </div>
            </div>
            {/* Add more slides if desired */}
          </div>

          {/* FAQ accordion (basic) */}
          <details className="dmn-widget__faq">
            <summary>Can I change my booking later?</summary>
            <p>Contact the venue via your confirmation email.</p>
          </details>
          <details className="dmn-widget__faq">
            <summary>What if I’m running late?</summary>
            <p>Please let the venue know; policies vary.</p>
          </details>

          {/* Countdown */}
          <p className={`dmn-widget__countdown${expired ? ' is-expired' : ''}`}>
            Hold expires in{' '}
            <strong>
              {mm}:{ss}
            </strong>
          </p>

          <div className="dmn-widget__actions">
            <button
              className="dmn-widget__btn dmn-widget__btn--ghost"
              onClick={() => dispatch({ type: 'BACK' })}
            >
              Back
            </button>
            <button className="dmn-widget__btn" onClick={onConfirm} disabled={expired}>
              Continue to payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
