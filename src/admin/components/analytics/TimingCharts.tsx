// When bookings take place (day and hour), how far ahead they are made, and group sizes.
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import type { AnalyticsReport } from '@admin/api';
import { useChartTheme } from './useChartTheme';
import { DataDisclosure, EmptyChart } from './parts';
import { fmtInt, fmtPct } from './format';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hourLabel = (h: number) => `${String(h).padStart(2, '0')}:00`;

/** Busiest days and times, as a table with shaded cells; every cell shows its number. */
export function Heatmap({
  cells,
  filtered,
  onClearFilters,
}: {
  cells: AnalyticsReport['timing']['heatmap'];
  filtered: boolean;
  onClearFilters: () => void;
}) {
  if (!cells.length) {
    return (
      <EmptyChart filtered={filtered} onClearFilters={onClearFilters}>
        No bookings with a date and time in this period.
      </EmptyChart>
    );
  }
  const hours = cells.map((c) => c.hour);
  const first = Math.min(...hours);
  const last = Math.max(...hours);
  const range = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  const max = Math.max(...cells.map((c) => c.bookings));
  const at = new Map(cells.map((c) => [`${c.weekday}-${c.hour}`, c.bookings]));
  const busiest = cells.reduce((a, b) => (b.bookings > a.bookings ? b : a));

  return (
    <>
      <p className="dmn-admin__help dmn-admin__flush">
        Busiest: {WEEKDAYS[busiest.weekday]}s at {hourLabel(busiest.hour)} (
        {fmtInt(busiest.bookings)} {busiest.bookings === 1 ? 'booking' : 'bookings'}). Times are the
        venue’s local time.
      </p>
      <div
        className="dmn-admin__table-wrap dmn-admin__heatmap-wrap"
        role="region"
        aria-label="Bookings by day and start time"
        tabIndex={0}
      >
        <table className="dmn-admin__heatmap">
          <caption className="screen-reader-text">
            Bookings by day of the week (rows) and start hour (columns)
          </caption>
          <thead>
            <tr>
              <td />
              {range.map((h) => (
                <th key={h} scope="col">
                  {hourLabel(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEEKDAYS.map((day, wd) => (
              <tr key={day}>
                <th scope="row">
                  <abbr title={day}>{day.slice(0, 3)}</abbr>
                </th>
                {range.map((h) => {
                  const n = at.get(`${wd}-${h}`) ?? 0;
                  // Five steps of the theme colour; the strongest uses the on-primary text colour.
                  const level = n === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4));
                  return (
                    <td key={h} className={`dmn-admin__heat dmn-admin__heat--${level}`}>
                      {n > 0 ? fmtInt(n) : <span className="screen-reader-text">0</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** Column chart for a distribution, with its figures as a table. */
export function Distribution({
  rows,
  caption,
  label,
  filtered,
  onClearFilters,
}: {
  rows: { key: string; label: string; bookings: number }[];
  caption: string;
  label: string;
  filtered: boolean;
  onClearFilters: () => void;
}) {
  const { theme, colours, reducedMotion } = useChartTheme();
  const total = rows.reduce((t, r) => t + r.bookings, 0);
  if (total === 0) {
    return (
      <EmptyChart filtered={filtered} onClearFilters={onClearFilters}>
        No bookings in this period.
      </EmptyChart>
    );
  }
  return (
    <>
      <div className="dmn-admin__chart" aria-hidden="true">
        <ThemeProvider theme={theme}>
          <BarChart
            height={240}
            margin={{ left: 8, right: 8, top: 16, bottom: 8 }}
            xAxis={[{ data: rows.map((r) => r.label), scaleType: 'band', label }]}
            yAxis={[{ min: 0, width: 48, tickMinStep: 1 }]}
            series={[
              {
                data: rows.map((r) => r.bookings),
                label: 'Bookings',
                color: colours.primary,
                valueFormatter: (n) => (n == null ? '' : `${fmtInt(n)} (${fmtPct(n / total)})`),
              },
            ]}
            grid={{ horizontal: true }}
            hideLegend
            skipAnimation={reducedMotion}
            borderRadius={6}
            sx={{
              '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': { stroke: colours.outline },
              '& .MuiChartsGrid-line': { stroke: colours.divider },
            }}
          />
        </ThemeProvider>
      </div>
      <DataDisclosure
        caption={caption}
        columns={[label, 'Bookings', 'Share']}
        rows={rows.map((r) => [r.label, fmtInt(r.bookings), fmtPct(r.bookings / total)])}
      />
    </>
  );
}
