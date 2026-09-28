// Anonymous booking widget events for the admin's Analytics section (POST dmn/v1/events):
// the widget opened, a step was completed, the customer was handed off to DesignMyNight's
// checkout, or the availability check failed. The only identifier is a random ID kept for the
// browser tab (sessionStorage), so the funnel can count visits; no cookies, nothing personal.
// Tracking must never get in the way of a booking, so every failure here is swallowed.
import { restUrl } from './http';

export type TrackEvent =
  | { event: 'view'; venue_id?: string | null }
  | {
      event: 'step';
      step: 'venue' | 'date' | 'experience' | 'time' | 'details';
      venue_id?: string | null;
      type_id?: string | null;
      num_people?: number | null;
    }
  | {
      event: 'handoff' | 'error';
      venue_id?: string | null;
      type_id?: string | null;
      num_people?: number | null;
    };

const SESSION_KEY = 'dmn_widget_session';
const SENT_KEY = 'dmn_widget_sent';
const FLUSH_DELAY = 2000;

let memorySession: string | null = null;
let memorySent = new Set<string>();
const queue: TrackEvent[] = [];
let timer: number | undefined;

// '0' when the admin turned tracking off (wp_localize_script sends strings).
const enabled = () => {
  const t = typeof window !== 'undefined' ? window.DMN_PUBLIC_BOOT?.tracking : '0';
  return t !== '0' && t !== false && (t as unknown) !== '';
};

function randomId(): string {
  const bytes = new Uint8Array(16);
  if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function session(): string {
  try {
    const stored = window.sessionStorage.getItem(SESSION_KEY);
    if (stored && /^[a-f0-9]{32}$/.test(stored)) return stored;
    const id = randomId();
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // Storage blocked (private mode, sandboxed frames): keep the ID for this page only.
    return (memorySession ??= randomId());
  }
}

/** Remembers events already sent this visit, so reloading or re-choosing doesn't resend them. */
function firstTime(key: string): boolean {
  try {
    const sent = new Set<string>(JSON.parse(window.sessionStorage.getItem(SENT_KEY) || '[]'));
    if (sent.has(key)) return false;
    sent.add(key);
    window.sessionStorage.setItem(SENT_KEY, JSON.stringify([...sent].slice(-100)));
    return true;
  } catch {
    if (memorySent.has(key)) return false;
    memorySent = new Set([...memorySent, key]);
    return true;
  }
}

function flush() {
  window.clearTimeout(timer);
  timer = undefined;
  if (!queue.length) return;
  const body = JSON.stringify({ session: session(), events: queue.splice(0, 20) });
  const url = restUrl('events');
  try {
    // sendBeacon survives the page unloading, which matters for the hand-off to DMN's checkout.
    const blob = new Blob([body], { type: 'application/json' });
    if (!navigator.sendBeacon?.(url, blob)) throw new Error('beacon refused');
  } catch {
    fetch(url, {
      method: 'POST',
      body,
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => undefined);
  }
  if (queue.length) flush();
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('pagehide', flush);
}

/** Today in the site's time zone, which the reports use, else the browser's. */
export function siteDay(now = new Date()): string {
  const tz = window.DMN_PUBLIC_BOOT?.timezone;
  const offset = tz && /^([+-])(\d{2}):(\d{2})$/.exec(tz);
  if (offset) {
    const mins = (offset[1] === '-' ? -1 : 1) * (Number(offset[2]) * 60 + Number(offset[3]));
    return new Date(now.getTime() + mins * 60000).toISOString().slice(0, 10);
  }
  if (tz) {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now);
    } catch {
      // Unknown time zone name: fall back to the browser's date.
    }
  }
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

/** Records the widget being open on this page today, once per page and site day. */
export function recordVisit() {
  const day = siteDay();
  track({ event: 'view' }, { once: `view:${window.location.pathname}:${day}` });
}

/**
 * Records a widget event. `once` keys events that should count once per visit (opening the
 * widget, completing a step with a given value); `immediate` sends straight away, before a
 * navigation.
 */
export function track(e: TrackEvent, opts: { once?: string; immediate?: boolean } = {}) {
  try {
    if (!enabled()) return;
    if (opts.once && !firstTime(opts.once)) return;
    // Reports only count activity from visitors who opened the widget in the period, so make
    // sure this page has a visit on today's date (local, like the site's reports) before any
    // other event. A tab left open overnight then counts as a new visit the next day.
    if (e.event !== 'view') recordVisit();
    queue.push(e);
    if (opts.immediate) flush();
    else if (timer === undefined) timer = window.setTimeout(flush, FLUSH_DELAY);
  } catch {
    // Never let analytics break the booking flow.
  }
}
