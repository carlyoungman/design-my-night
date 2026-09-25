import { createTheme } from '@mui/material';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import dayjs from 'dayjs';
import type { DayName, AllowedDaysInput } from '@app/types';

/**
 * @name parseAllowedDays
 * @description Parse an input that may be a comma-separated string of day names,
 *              an array of day names, or null/undefined and return a validated array
 *              of day names. Invalid or empty inputs return `undefined`.
 * @param {string | DayName[] | null | undefined} input - Comma-separated day names (e.g. "Monday,Tuesday"),
 *                                                         an array of `DayName`, or null/undefined.
 * @returns {DayName[] | undefined} Array of validated `DayName` values or `undefined` if input is falsy or no valid days found.
 */
export function parseAllowedDays(input: AllowedDaysInput): DayName[] | undefined {
  const VALID_DAYS: DayName[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  if (!input) return undefined;

  if (Array.isArray(input)) {
    return input;
  }

  const days = input
    .split(',')
    .map((d) => d.trim())
    .filter((d): d is DayName => VALID_DAYS.includes(d as DayName));

  return days.length ? days : undefined;
}

/**
 * @name todayISO
 * @description Returns today's date as an ISO string in the format YYYY-MM-DD.
 * @returns {string} ISO date string for today.
 */

export const todayISO = (): string => dayjs().format('YYYY-MM-DD');

/**
 * @name sixMonthsISO
 * @description Returns the date six months from today as an ISO string in the format YYYY-MM-DD.
 * @returns {string} ISO date string six months from now.
 */
export const sixMonthsISO = (): string => dayjs().add(6, 'month').format('YYYY-MM-DD');

/**
 * Theme for the MUI DateCalendar. Colours come from the widget's CSS custom properties
 * (defined on `.dmn-widget-root`), so the calendar follows the palette and any site re-theme.
 * They are only used in style overrides: MUI's palette needs literal colours to compute contrast.
 */
export const calendarTheme = createTheme({
  typography: { fontFamily: 'inherit' },
  components: {
    MuiDateCalendar: {
      styleOverrides: {
        root: {
          width: '100%',
          maxWidth: 420,
          height: 'auto',
          maxHeight: 'none',
          margin: 0,
          color: 'var(--c-text)',
          backgroundColor: 'var(--c-surface)',
          border: '1px solid var(--c-divider)',
          borderRadius: 'var(--border-radius)',
          '& .MuiDayCalendar-header, & .MuiDayCalendar-weekContainer': {
            justifyContent: 'space-around',
          },
          '& .MuiDayCalendar-weekDayLabel': { color: 'var(--c-text)', fontWeight: 600 },
          '& .MuiPickersSlideTransition-root': { minHeight: 260 },
        },
      },
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: { color: 'var(--c-text)' },
        label: { fontWeight: 600 },
      },
    },
    MuiPickersArrowSwitcher: {
      styleOverrides: {
        button: {
          color: 'var(--c-text)',
          '&:focus-visible': { outline: '2px solid var(--c-primary)' },
          '&.Mui-disabled': { color: 'var(--c-outline)' },
        },
      },
    },
    MuiPickersDay: {
      styleOverrides: {
        root: {
          fontSize: 14,
          color: 'var(--c-text)',
          fontWeight: 600,
          '&:hover': { backgroundColor: 'var(--c-divider)' },
          '&:focus-visible': {
            outline: '2px solid var(--c-primary)',
            outlineOffset: 1,
            backgroundColor: 'var(--c-divider)',
          },
          // Unavailable days: struck through as well as faded, so it's not colour alone.
          '&.Mui-disabled:not(.Mui-selected)': {
            color: 'var(--c-outline)',
            fontWeight: 400,
            textDecoration: 'line-through',
          },
          '&.MuiPickersDay-today:not(.Mui-selected)': {
            border: '1px solid var(--c-outline)',
          },
          '&.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus': {
            color: 'var(--c-on-primary)',
            backgroundColor: 'var(--c-primary)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { color: 'var(--c-text)' },
      },
    },
  },
});

/**
 * @name toNum
 * @description Parse a numeric value from a string, allowing commas and an optional decimal (up to 2 places).
 *              Returns 0 for null/undefined/invalid input.
 * @param {string | null | undefined} text - Input text to parse.
 * @returns {number} Parsed numeric value or 0.
 */
export const toNum = (text?: string | null) => {
  if (!text) return 0;
  const clean = String(text).replace(/,/g, '');
  const m = clean.match(/-?\d+(?:\.\d{1,2})?/);
  const n = m ? Number(m[0]) : 0;
  return Number.isFinite(n) ? n : 0;
};

/**
 * @name fmt
 * @description Format a number as GBP currency using the en-GB locale.
 * @param {number} n - Number to format.
 * @returns {string} Formatted currency string (e.g. "£1,234.56").
 */
export const fmt = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n || 0);

/**
 * @name fmtDate
 * @description Convert an ISO date string (YYYY-MM-DD) into a human-readable en-GB date string
 *              with weekday, day, month and year. Returns an em dash (—) when input is falsy.
 * @param {string | null | undefined} d - ISO date string.
 * @returns {string} Localized date string or '—' if input missing.
 */
export function fmtDate(d?: string | null) {
  if (!d) return '—';
  const [y, m, day] = d.split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, day ?? 1));
  return dt.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * @name extractValidationDateBlock
 * @description Safely extract the nested `validation.date` value from different API response shapes.
 *              Returns null when the path is not present.
 * @param {any} res - API response object.
 * @returns {any | null} The extracted `validation.date` value or null.
 */
export const extractValidationDateBlock = (res: any) =>
  res?.payload?.validation?.date ??
  res?.data?.payload?.validation?.date ??
  res?.data?.validation?.date ??
  res?.validation?.date ??
  null;

/**
 * @name parseSuggested
 * @description Parse a suggested date item which may be a string or an object with `date`/`value`
 *              and an optional `valid` flag. Returns an object containing an ISO date string
 *              and the `valid` boolean when applicable, otherwise an empty object.
 * @param {any} item - Suggested item to parse.
 * @returns {{ iso?: string; valid?: boolean }} Parsed suggestion.
 */
export const parseSuggested = (item: any): { iso?: string; valid?: boolean } => {
  const raw = item?.date ?? item?.value ?? item;
  if (typeof raw !== 'string') return {};
  return { iso: dayjs(raw).format('YYYY-MM-DD'), valid: !!item?.valid };
};

/**
 * @name hhmmFromState
 * @description Extract an `HH:MM` time string from the given input. If the input already
 *              contains an `HH:MM` pattern that is returned. Otherwise, attempts to parse
 *              the input as a Date and returns the local time in `HH:MM` format.
 *              Returns null if no time can be extracted.
 * @param {string | null | undefined} input - Input string or date to parse.
 * @returns {string | null} Time string in `HH:MM` format or null.
 */
export function hhmmFromState(input?: string | null): string | null {
  if (!input) return null;
  const m = /(\d{2}:\d{2})/.exec(input);
  if (m) return m[1];
  const d = new Date(input);
  if (!Number.isNaN(d.getTime())) {
    const h = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${mm}`;
  }
  return null;
}

/**
 * @name parseCsvIds
 * @description Parse a comma-separated list of IDs, trimming whitespace and removing duplicates.
 *              Returns undefined for empty or falsy input.
 * @param {string | undefined} v - Comma-separated IDs.
 * @returns {string[] | undefined} Array of unique, trimmed IDs or undefined.
 */
export function parseCsvIds(v?: string): string[] | undefined {
  if (!v) return undefined;
  const ids = v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.length ? Array.from(new Set(ids)) : undefined;
}
