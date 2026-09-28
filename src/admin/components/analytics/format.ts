// Number and date formatting for the Analytics section, in the user's locale.
import type { AnalyticsFilters } from '@admin/api';

const int = new Intl.NumberFormat();
const dec1 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const money = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const pct = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 1 });
const dayFmt = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});
const fullDayFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' });
const dateTimeFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export const fmtInt = (n: number) => int.format(n);
export const fmtDec = (n: number) => dec1.format(n);
/** Booking value. DMN doesn't say which currency, so no symbol is shown; it is the venue's own. */
export const fmtMoney = (n: number) => money.format(n);
export const fmtPct = (n: number) => pct.format(n);

/** A `Y-m-d` date as "3 Mar"; dates are calendar days, so format them in UTC. */
export const fmtDay = (ymd: string) => dayFmt.format(new Date(`${ymd}T00:00:00Z`));
export const fmtFullDay = (ymd: string) => fullDayFmt.format(new Date(`${ymd}T00:00:00Z`));
export const fmtDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));

export const plural = (n: number, one: string, many: string) =>
  `${fmtInt(n)} ${n === 1 ? one : many}`;

/** Today in the site's time zone (reports use it), else the browser's, as `Y-m-d`. */
export function todayYmd(now = new Date()) {
  const site = window.DMN_ADMIN_BOOT?.today;
  if (site && /^\d{4}-\d{2}-\d{2}$/.test(site)) {
    // The site's date when the page loaded, moved on by the days since (a tab left open overnight).
    return addDays(site, localDaysBetween(LOADED_AT, now));
  }
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const LOADED_AT = new Date();

/** Whole calendar days between two times, in the browser's time zone. */
function localDaysBetween(a: Date, b: Date) {
  const day = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((day(b) - day(a)) / 86400000);
}

export function addDays(ymd: string, days: number) {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export type RangePreset = '7' | '30' | '90' | '365' | 'custom';

export const PRESETS: { value: RangePreset; label: string }[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last 12 months' },
  { value: 'custom', label: 'Custom range' },
];

/** The range for a preset: the last N days, today included. */
export function presetRange(preset: Exclude<RangePreset, 'custom'>) {
  const to = todayYmd();
  return { from: addDays(to, -(Number(preset) - 1)), to };
}

export function defaultFilters(): AnalyticsFilters {
  return { ...presetRange('30'), basis: 'created', venue: '', type: '' };
}

/** Change against the previous period, or null when there is nothing to compare with. */
export function change(current: number | null, previous: number | null) {
  if (current == null || previous == null || previous === 0) return null;
  return (current - previous) / previous;
}

/** Saves a CSV string as a download. */
export function downloadCsv(filename: string, csv: string) {
  // The byte order mark makes Excel read the file as UTF-8.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
