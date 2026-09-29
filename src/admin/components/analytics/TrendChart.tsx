// Bookings, guests, value or widget hand-offs over the period, one metric at a time.
import React, { useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LineChart } from '@mui/x-charts/LineChart';
import type { AnalyticsReport } from '@admin/api';
import { useChartTheme } from './useChartTheme';
import { DataDisclosure, EmptyChart } from './parts';
import { fmtDay, fmtFullDay, fmtInt, fmtMoney } from './format';
import { Segmented } from '@admin/components/Choices';

type Metric = 'bookings' | 'covers' | 'value' | 'handoffs';

const METRICS: { value: Metric; label: string; long: string }[] = [
  { value: 'bookings', label: 'Bookings', long: 'Bookings' },
  { value: 'covers', label: 'Guests', long: 'Guests' },
  { value: 'value', label: 'Value', long: 'Booking value' },
  { value: 'handoffs', label: 'Checkouts', long: 'Widget visitors sent to checkout' },
];

const ymd = (d: Date) => d.toISOString().slice(0, 10);

export default function TrendChart({
  series,
  hasValue,
  filtered,
  onClearFilters,
}: {
  series: AnalyticsReport['timeseries'];
  /** Leaves out the Value option when DesignMyNight sends no booking values. */
  hasValue: boolean;
  filtered: boolean;
  onClearFilters: () => void;
}) {
  const [chosen, setChosen] = useState<Metric>('bookings');
  // Value drops out when no booking has one (after a retention or environment change).
  const metric: Metric = chosen === 'value' && !hasValue ? 'bookings' : chosen;
  const setMetric = setChosen;
  const { theme, colours, reducedMotion } = useChartTheme();
  const def = METRICS.find((m) => m.value === metric)!;
  const weekly = series.interval === 'week';
  const format = (n: number | null) =>
    n == null ? '–' : metric === 'value' ? fmtMoney(n) : fmtInt(n);
  const periodLabel = (d: string) => (weekly ? `Week of ${fmtFullDay(d)}` : fmtFullDay(d));

  const dates = useMemo(() => series.points.map((p) => new Date(`${p.date}T00:00:00Z`)), [series]);
  const values = series.points.map((p) => p[metric]);
  const hasData = values.some((v) => v > 0);

  return (
    <>
      <div className="dmn-admin__field dmn-admin__analytics-metric">
        <span className="dmn-admin__label" id="dmn-trend-metric-label">
          Show
        </span>
        <Segmented
          compact
          value={metric}
          options={METRICS.filter((m) => hasValue || m.value !== 'value')}
          onChange={setMetric}
          labelledBy="dmn-trend-metric-label"
        />
      </div>

      {!hasData ? (
        <EmptyChart filtered={filtered} onClearFilters={onClearFilters}>
          {metric === 'handoffs'
            ? 'No widget visitors went to checkout in this period.'
            : 'No bookings in this period.'}
        </EmptyChart>
      ) : (
        <div className="dmn-admin__chart" aria-hidden="true">
          <ThemeProvider theme={theme}>
            <LineChart
              height={280}
              margin={{ left: 8, right: 16, top: 16, bottom: 8 }}
              xAxis={[
                {
                  data: dates,
                  scaleType: 'time',
                  valueFormatter: (d: Date, ctx) =>
                    ctx.location === 'tooltip' ? periodLabel(ymd(d)) : fmtDay(ymd(d)),
                },
              ]}
              yAxis={[{ min: 0, width: 56, valueFormatter: (n: number) => format(n) }]}
              series={[
                {
                  data: values,
                  label: def.long,
                  color: colours.primary,
                  area: true,
                  curve: 'monotoneX',
                  showMark: series.points.length <= 31,
                  valueFormatter: (n) => format(n),
                },
              ]}
              grid={{ horizontal: true }}
              hideLegend
              skipAnimation={reducedMotion}
              sx={{
                '& .MuiAreaElement-root': { fillOpacity: 0.12 },
                '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': { stroke: colours.outline },
                '& .MuiChartsGrid-line': { stroke: colours.divider },
              }}
            />
          </ThemeProvider>
        </div>
      )}

      <DataDisclosure
        caption={`${def.long} by ${weekly ? 'week' : 'day'}`}
        columns={[weekly ? 'Week starting' : 'Date', def.long]}
        rows={series.points.map((p) => [fmtFullDay(p.date), format(p[metric])])}
      />
    </>
  );
}
