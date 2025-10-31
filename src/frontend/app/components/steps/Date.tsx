import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { ThemeProvider } from '@mui/material/styles';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import {
  darkTheme,
  extractValidationDateBlock,
  parseSuggested,
  sixMonthsISO,
  todayISO,
} from '../../utils/helpers';
import { checkAvailability } from '../../../api/public';
import LoadingAnimation from '../LoadingAnimation';
import { scrollToSection } from '../../utils/scroll';

export function Date() {
  const minDateISO = todayISO();
  const maxDateISO = sixMonthsISO();

  const { date: selectedDateISO, venueId, partySize } = useWidgetState();
  const dispatch = useWidgetDispatch();

  // Stable Dayjs bounds
  const minDate = useMemo(() => dayjs(minDateISO), [minDateISO]);
  const maxDate = useMemo(() => dayjs(maxDateISO), [maxDateISO]);

  // Visible month anchor
  const initialMonth = useMemo(
    () => (selectedDateISO ? dayjs(selectedDateISO).startOf('month') : dayjs().startOf('month')),
    [selectedDateISO],
  );
  const [visibleMonth] = useState<Dayjs>(initialMonth);

  // Valid ISO dates for the visible month only (from DMN)
  const [validDates, setValidDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);

  // Stable key for the visible month (avoid depending on Dayjs objects)
  const monthKey = useMemo(() => visibleMonth.format('YYYY-MM'), [visibleMonth]);

  // Fetch valid suggestions for the visible month (fields=date)
  useEffect(() => {
    if (!venueId || partySize == null) {
      setValidDates(new Set());
      return;
    }

    let cancelled = false;
    const anchorISO = dayjs(monthKey + '-01').format('YYYY-MM-DD');

    (async () => {
      try {
        setLoading(true);
        const res = await checkAvailability(
          {
            venue_id: venueId,
            num_people: partySize,
            date: anchorISO,
          },
          'date',
        );

        const dateBlock = extractValidationDateBlock(res);
        const sv: any[] = Array.isArray(dateBlock?.suggestedValues)
          ? dateBlock.suggestedValues
          : [];

        const next = new Set<string>();
        for (const item of sv) {
          const { iso, valid } = parseSuggested(item);
          if (!iso || valid !== true) continue;
          const d = dayjs(iso);
          if (d.isBefore(minDate, 'day') || d.isAfter(maxDate, 'day')) continue;
          if (d.format('YYYY-MM') === monthKey) next.add(iso);
        }

        if (!cancelled) setValidDates(next);
      } catch {
        if (!cancelled) setValidDates(new Set());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [monthKey, venueId, minDate, maxDate, extractValidationDateBlock, parseSuggested]);

  // Selection rules:
  // - Always enforce min/max.
  // - If in the visible month: only allow DMN-suggested valid dates.
  // - Other months (within 6 months): allow freely.
  const isSelectable = useCallback(
    (d: Dayjs) => {
      if (!d || !d.isValid()) return false;
      if (d.isBefore(minDate, 'day') || d.isAfter(maxDate, 'day')) return false;

      const dMonthKey = d.format('YYYY-MM');
      if (dMonthKey === monthKey) {
        return validDates.has(d.format('YYYY-MM-DD'));
      }
      return true;
    },
    [minDate, maxDate, monthKey, validDates],
  );

  const pick = useCallback(
    (d: Dayjs) => {
      if (!isSelectable(d)) return;
      // Set date, then clear dependent selections so types & times refresh
      dispatch({ type: 'SET_DATE', date: d.format('YYYY-MM-DD') });
      dispatch({ type: 'SET_TIME', value: '' as any });
      dispatch({ type: 'SET_TYPE', value: '' as any });
      scrollToSection('section.time', { offset: { mobile: 190, desktop: 200 }, delay: 400 });
    },
    [dispatch, isSelectable],
  );

  const today = useMemo(() => dayjs(), []);
  const tomorrow = useMemo(() => dayjs().add(1, 'day'), []);
  const value = selectedDateISO ? dayjs(selectedDateISO) : null;

  return (
    <section className="date">
      {!loading && validDates.size === 0 && (
        <LoadingAnimation type="required" text="Venue required" />
      )}
      {loading && validDates.size === 0 && (
        <LoadingAnimation type="loading" text="Checking availability…" />
      )}
      {!loading && validDates.size !== 0 && (
        <>
          <div className="date__quick-row" aria-label="Quick date picks">
            <button
              type="button"
              className="date__quick-btn"
              onClick={() => pick(today)}
              disabled={!isSelectable(today)}
            >
              Today
            </button>
            <button
              type="button"
              className="date__quick-btn"
              onClick={() => pick(tomorrow)}
              disabled={!isSelectable(tomorrow)}
            >
              Tomorrow
            </button>
          </div>
          <div className="date__calendar" data-loading={loading ? '' : undefined}>
            <ThemeProvider theme={darkTheme}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  value={value}
                  onChange={(newVal) => {
                    if (newVal) pick(newVal);
                  }}
                  views={['day']}
                  minDate={minDate}
                  maxDate={maxDate}
                  shouldDisableDate={(d) => !isSelectable(d)}
                />
              </LocalizationProvider>
            </ThemeProvider>
          </div>
        </>
      )}
    </section>
  );
}
