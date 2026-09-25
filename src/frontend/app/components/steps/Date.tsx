import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { ThemeProvider } from '@mui/material/styles';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DateProps, DayName } from '@app/types';
import { useWidgetDispatch, useWidgetState } from '@app/WidgetProvider';
import {
  calendarTheme,
  extractValidationDateBlock,
  parseSuggested,
  sixMonthsISO,
  todayISO,
} from '@app/utils/helpers';
import { checkAvailability } from '@api/public';
import LoadingAnimation from '@app/components/LoadingAnimation';
import { StepPrerequisite } from '@app/components/StepPrerequisite';
import { StateMessage } from '@app/components/StateMessage';
import { goToStep } from '@app/utils/scroll';

/** Fetch the bookable dates in one month (YYYY-MM) that fall inside the booking window. */
async function fetchMonthDates(
  venueId: string,
  partySize: number,
  month: string,
  minDate: Dayjs,
  maxDate: Dayjs,
): Promise<Set<string>> {
  const res = await checkAvailability(
    { venue_id: venueId, num_people: partySize, date: `${month}-01` },
    'date',
  );
  const dateBlock = extractValidationDateBlock(res);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sv: any[] = Array.isArray(dateBlock?.suggestedValues) ? dateBlock.suggestedValues : [];

  const out = new Set<string>();
  for (const item of sv) {
    const { iso, valid } = parseSuggested(item);
    if (!iso || valid !== true) continue;
    const d = dayjs(iso);
    if (d.isBefore(minDate, 'day') || d.isAfter(maxDate, 'day')) continue;
    if (d.format('YYYY-MM') === month) out.add(iso);
  }
  return out;
}

export function Date({ allowedDays }: DateProps) {
  const minDateISO = todayISO();
  const maxDateISO = sixMonthsISO();

  const { date: selectedDateISO, venueId, partySize } = useWidgetState();
  const dispatch = useWidgetDispatch();

  const minDate = useMemo(() => dayjs(minDateISO), [minDateISO]);
  const maxDate = useMemo(() => dayjs(maxDateISO), [maxDateISO]);

  // The month shown in the calendar; availability is fetched per month.
  const [visibleMonth, setVisibleMonth] = useState<Dayjs>(() =>
    selectedDateISO ? dayjs(selectedDateISO).startOf('month') : dayjs().startOf('month'),
  );

  const [validDates, setValidDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const monthKey = useMemo(() => visibleMonth.format('YYYY-MM'), [visibleMonth]);
  const allowedDaySet = useMemo(
    () => (allowedDays && allowedDays.length ? new Set<DayName>(allowedDays) : null),
    [allowedDays],
  );

  useEffect(() => {
    if (!venueId || partySize == null) {
      setValidDates(new Set());
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(false);
        const next = await fetchMonthDates(venueId, partySize, monthKey, minDate, maxDate);
        if (!cancelled) setValidDates(next);
      } catch {
        if (!cancelled) {
          setValidDates(new Set());
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [monthKey, venueId, partySize, minDate, maxDate, attempt]);

  const today = useMemo(() => dayjs(), []);
  const tomorrow = useMemo(() => dayjs().add(1, 'day'), []);
  const tomorrowMonth = tomorrow.format('YYYY-MM');

  // On the last day of a month, tomorrow falls outside the month on screen, so check it on its own
  // for the "Tomorrow" quick pick.
  const [tomorrowAvailable, setTomorrowAvailable] = useState(false);
  useEffect(() => {
    if (!venueId || partySize == null || tomorrowMonth === monthKey) {
      setTomorrowAvailable(false);
      return;
    }
    let cancelled = false;
    fetchMonthDates(venueId, partySize, tomorrowMonth, minDate, maxDate)
      .then((dates) => !cancelled && setTomorrowAvailable(dates.has(tomorrow.format('YYYY-MM-DD'))))
      .catch(() => !cancelled && setTomorrowAvailable(false));
    return () => {
      cancelled = true;
    };
  }, [venueId, partySize, tomorrowMonth, monthKey, tomorrow, minDate, maxDate, attempt]);

  const isSelectable = useCallback(
    (d: Dayjs) => {
      if (!d || !d.isValid()) return false;
      if (d.isBefore(minDate, 'day') || d.isAfter(maxDate, 'day')) return false;
      if (allowedDaySet && allowedDaySet.size > 0) {
        const dayName = d.format('dddd') as DayName;
        if (!allowedDaySet.has(dayName)) return false;
      }
      if (d.format('YYYY-MM') !== monthKey) {
        return d.isSame(tomorrow, 'day') && tomorrowAvailable;
      }
      if (loading || error) return false;
      return validDates.has(d.format('YYYY-MM-DD'));
    },
    [
      minDate,
      maxDate,
      monthKey,
      validDates,
      allowedDaySet,
      loading,
      error,
      tomorrow,
      tomorrowAvailable,
    ],
  );

  const pick = useCallback(
    (d: Dayjs) => {
      if (!isSelectable(d)) return;
      dispatch({ type: 'SET_DATE', date: d.format('YYYY-MM-DD') });
      if (d.format('YYYY-MM') !== monthKey) setVisibleMonth(d.startOf('month'));
      goToStep('experience');
    },
    [dispatch, isSelectable, monthKey],
  );

  const value = selectedDateISO ? dayjs(selectedDateISO) : null;

  if (!venueId || partySize == null) {
    return <StepPrerequisite requires={['venue', 'partySize']} />;
  }

  const monthLabel = visibleMonth.format('MMMM YYYY');
  const showQuickPicks =
    (!allowedDaySet || allowedDaySet.size === 0) &&
    monthKey === today.format('YYYY-MM') &&
    !loading &&
    !error &&
    (validDates.size > 0 || tomorrowAvailable);

  return (
    <div className="date">
      {loading && <LoadingAnimation text={`Checking availability for ${monthLabel}…`} />}
      {!loading && error && (
        <StateMessage kind="error" onAction={() => setAttempt((n) => n + 1)}>
          We couldn’t check availability for {monthLabel}.
        </StateMessage>
      )}
      {!loading && !error && validDates.size === 0 && (
        <StateMessage kind="empty">
          No dates are available in {monthLabel}
          {partySize ? ` for ${partySize} ${partySize === 1 ? 'person' : 'people'}` : ''}. Try the
          next month or a different group size.
        </StateMessage>
      )}

      {showQuickPicks && (
        <div className="date__quick-row" role="group" aria-label="Quick picks">
          <button
            type="button"
            className="date__quick-btn"
            onClick={() => pick(today)}
            disabled={!isSelectable(today)}
            aria-pressed={selectedDateISO === today.format('YYYY-MM-DD')}
          >
            Today
          </button>
          <button
            type="button"
            className="date__quick-btn"
            onClick={() => pick(tomorrow)}
            disabled={!isSelectable(tomorrow)}
            aria-pressed={selectedDateISO === tomorrow.format('YYYY-MM-DD')}
          >
            Tomorrow
          </button>
        </div>
      )}

      {/* Stays mounted while a month loads so month navigation isn't reset. */}
      <div className="date__calendar" aria-busy={loading || undefined}>
        <ThemeProvider theme={calendarTheme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={value}
              referenceDate={visibleMonth}
              onChange={(newVal) => {
                if (newVal) pick(newVal);
              }}
              onMonthChange={(m) => setVisibleMonth(m.startOf('month'))}
              views={['day']}
              minDate={minDate}
              maxDate={maxDate}
              shouldDisableDate={(d) => !isSelectable(d)}
            />
          </LocalizationProvider>
        </ThemeProvider>
      </div>
    </div>
  );
}
