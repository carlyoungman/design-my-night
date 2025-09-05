import * as React from 'react';
import dayjs from 'dayjs';
import { Field } from '@base-ui-components/react/field';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { ThemeProvider } from '@mui/material/styles';

import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { StepShell } from '../StepShell';

import { darkTheme, sixMonthsISO, todayISO } from '../../utils/helpers';

type Props = {
  suggestedDates?: string[];
  minDateISO?: string;
  maxDateISO?: string;
};

export function DateStep() {
  const minDateISO = todayISO(),
    maxDateISO = sixMonthsISO();
  const { date: selectedDateISO } = useWidgetState();
  const dispatch = useWidgetDispatch();

  const minDate = dayjs(minDateISO);
  const maxDate = dayjs(maxDateISO);

  const isSelectable = (d: dayjs.Dayjs) => {
    if (!d || !d.isValid()) return false;
    return !(d.isBefore(minDate, 'day') || d.isAfter(maxDate, 'day'));
  };

  const pick = (d: dayjs.Dayjs) => {
    if (!isSelectable(d)) return;
    dispatch({ type: 'SET_DATE', date: d.format('YYYY-MM-DD') });
  };

  const today = dayjs();
  const tomorrow = dayjs().add(1, 'day');

  const value = selectedDateISO ? dayjs(selectedDateISO) : null;

  return (
    <StepShell className="date">
      <p className="step__label">Select your date</p>
      <div className="calendar__quick-row" aria-label="Quick date picks">
        <button
          type="button"
          className="calendar__quick-btn"
          onClick={() => pick(today)}
          disabled={!isSelectable(today)}
        >
          Today
        </button>
        <button
          type="button"
          className="calendar__quick-btn"
          onClick={() => pick(tomorrow)}
          disabled={!isSelectable(tomorrow)}
        >
          Tomorrow
        </button>
      </div>

      <Field.Root className="calendar">
        <Field.Control
          render={
            <ThemeProvider theme={darkTheme}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  value={value}
                  onChange={(newVal) => {
                    if (!newVal) return;
                    pick(newVal);
                  }}
                  views={['day']}
                  minDate={minDate}
                  maxDate={maxDate}
                />
              </LocalizationProvider>
            </ThemeProvider>
          }
        />
      </Field.Root>
    </StepShell>
  );
}
