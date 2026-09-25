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
import { scrollToSection } from '@app/utils/scroll';

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
    const anchorISO = dayjs(monthKey + '-01').format('YYYY-MM-DD');

    (async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await checkAvailability(
          {
            venue_id: venueId,
            num_people: partySize,
            date: anchorISO,
          },
          'date',
        );

        const dateBlock = extractValidationDateBlock(res);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const isSelectable = useCallback(
    (d: Dayjs) => {
      if (!d || !d.isValid()) return false;
      if (d.isBefore(minDate, 'day') || d.isAfter(maxDate, 'day')) return false;
      if (allowedDaySet && allowedDaySet.size > 0) {
        const dayName = d.format('dddd') as DayName;
        if (!allowedDaySet.has(dayName)) return false;
      }
      if (loading || error) return false;
      if (d.format('YYYY-MM') !== monthKey) return false;
      return validDates.has(d.format('YYYY-MM-DD'));
    },
    [minDate, maxDate, monthKey, validDates, allowedDaySet, loading, error],
  );

  const pick = useCallback(
    (d: Dayjs) => {
      if (!isSelectable(d)) return;
      dispatch({ type: 'SET_DATE', date: d.format('YYYY-MM-DD') });
      scrollToSection('section[data-step="experience"]', {
        offset: { mobile: 190, desktop: 200 },
        delay: 400,
      });
    },
    [dispatch, isSelectable],
  );

  const today = useMemo(() => dayjs(), []);
  const tomorrow = useMemo(() => dayjs().add(1, 'day'), []);
  const value = selectedDateISO ? dayjs(selectedDateISO) : null;

  if (!venueId || partySize == null) {
    return <StepPrerequisite requires={['venue', 'partySize']} />;
  }

  const monthLabel = visibleMonth.format('MMMM YYYY');
  const showQuickPicks =
    (!allowedDaySet || allowedDaySet.size === 0) && monthKey === today.format('YYYY-MM');

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
          {partySize ? ` for ${partySize} ${partySize === 1 ? 'person' : 'people'}` : ''}. Try
          the next month or a different group size.
        </StateMessage>
      )}

      {showQuickPicks && !loading && !error && validDates.size > 0 && (
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
