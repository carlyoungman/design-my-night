import { createTheme } from '@mui/material';
import dayjs from 'dayjs';

export const todayISO = (): string => dayjs().format('YYYY-MM-DD');

// helpers.tsx
export const sixMonthsISO = (): string => dayjs().add(6, 'month').format('YYYY-MM-DD');

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#000', paper: '#000' },
    text: { primary: '#fff', secondary: 'rgba(255,255,255,.7)' },
    primary: { main: '#fff' },
  },
  components: {
    // @ts-ignore
    MuiDateCalendar: {
      styleOverrides: {
        root: {
          width: '100%',
          backgroundColor: '#000',
          color: '#fff',
          '& .MuiDayCalendar-weekContainer': {
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 7.5,
            padding: 7.5,
          },
          '& .MuiDayCalendar-weekDayLabel': { color: 'rgba(255,255,255,.7)' },
          '& .MuiPickersDay-root': { width: '100%', margin: 0 },
        },
      },
    },
    MuiPickersArrowSwitcher: {
      styleOverrides: {
        root: {
          '& .MuiSvgIcon-root': {
            '& path': { display: 'none' },
            backgroundImage:
              'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24taWNvbiBsdWNpZGUtY2hldnJvbi1kb3duIj48cGF0aCBkPSJtNiA5IDYgNiA2LTYiLz48L3N2Zz4=")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            width: 24,
            height: 24,
          },
          '& .MuiIconButton-root:first-of-type .MuiSvgIcon-root': { transform: 'rotate(90deg)' },
          '& .MuiIconButton-root:last-of-type .MuiSvgIcon-root': { transform: 'rotate(-90deg)' },
        },
      },
    },
    MuiPickersCalendarHeader: {
      styleOverrides: { root: { color: '#fff' }, label: { color: '#fff' } },
    },
    MuiPickersDay: {
      styleOverrides: {
        root: {
          color: '#fff',
          '&.Mui-disabled': { color: 'rgba(255,255,255,0.5)' },
          '&:hover': { backgroundColor: '#FFF', border: '1px solid #fff', color: '#000' },
          '&.Mui-selected': {
            backgroundColor: '#FF00FF',
            border: '1px solid #fff',
            color: '#fff',
            '&:hover': { backgroundColor: '#ff33ff', border: '1px solid #fff' },
          },
          '&.MuiPickersDay-today': { border: '1px solid #fff', offset: 'none' },
        },
      },
    },
  },
});

export const toNum = (text?: string | null) => {
  if (!text) return 0;
  const clean = String(text).replace(/,/g, '');
  const m = clean.match(/-?\d+(?:\.\d{1,2})?/);
  const n = m ? Number(m[0]) : 0;
  return Number.isFinite(n) ? n : 0;
};

export const fmt = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n || 0);

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

export const extractValidationDateBlock = (res: any) =>
  res?.payload?.validation?.date ??
  res?.data?.payload?.validation?.date ??
  res?.data?.validation?.date ??
  res?.validation?.date ??
  null;

export const parseSuggested = (item: any): { iso?: string; valid?: boolean } => {
  const raw = item?.date ?? item?.value ?? item;
  if (typeof raw !== 'string') return {};
  return { iso: dayjs(raw).format('YYYY-MM-DD'), valid: !!item?.valid };
};

/**
 * Extracts an `hh:mm` time string from the input, if possible.
 * @param input A string or null/undefined value to parse.
 * @returns The `hh:mm` time string, or null if not found.
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
