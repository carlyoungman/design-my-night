// Headline figures for the period, each compared with the same number of days before it.
import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { AnalyticsSummary } from '@admin/api';
import { change, fmtDec, fmtFullDay, fmtInt, fmtMoney, fmtPct, plural } from './format';

type Kpi = {
  key: string;
  label: string;
  value: string;
  /** Raw figures for the comparison; null leaves it out. */
  current: number | null;
  previous: number | null;
  formatPrevious: (n: number) => string;
  note?: string;
};

export default function KpiRow({
  summary,
  hasValue,
}: {
  summary: AnalyticsSummary;
  /** False when DesignMyNight sends no booking values: deposits are shown instead. */
  hasValue: boolean;
}) {
  const { current: c, previous: p, period } = summary;
  const kpis: Kpi[] = [
    {
      key: 'bookings',
      label: 'Bookings',
      value: fmtInt(c.bookings),
      current: c.bookings,
      previous: p.bookings,
      formatPrevious: fmtInt,
      note:
        c.inactive > 0
          ? `Excludes ${plural(c.inactive, 'rejected, lost or deleted booking', 'rejected, lost or deleted bookings')}`
          : undefined,
    },
    {
      key: 'covers',
      label: 'Guests',
      value: fmtInt(c.covers),
      current: c.covers,
      previous: p.covers,
      formatPrevious: fmtInt,
    },
    hasValue
      ? {
          key: 'value',
          label: 'Booking value',
          value: c.value != null ? fmtMoney(c.value) : 'Not recorded',
          current: c.value,
          previous: p.value,
          formatPrevious: fmtMoney,
          note:
            c.deposits != null
              ? `Deposits ${fmtMoney(c.deposits)}. In each venue’s currency.`
              : 'In each venue’s currency.',
        }
      : {
          key: 'deposits',
          label: 'Deposits taken',
          value: fmtMoney(c.deposits ?? 0),
          current: c.deposits ?? 0,
          previous: p.deposits ?? 0,
          formatPrevious: fmtMoney,
          note: 'In each venue’s currency. DesignMyNight doesn’t provide booking values.',
        },
    {
      key: 'party',
      label: 'Average group size',
      value: c.average_party != null ? fmtDec(c.average_party) : '–',
      current: c.average_party,
      previous: p.average_party,
      formatPrevious: fmtDec,
      note: 'Guests per booking',
    },
    {
      key: 'conversion',
      label: 'Widget conversion',
      value: c.conversion != null ? fmtPct(c.conversion) : '–',
      current: c.conversion,
      previous: p.conversion,
      formatPrevious: fmtPct,
      note:
        c.widget_views == null
          ? `${plural(c.widget_handoffs, 'visitor', 'visitors')} went to checkout. Conversion isn’t available while filtering by venue or activity.`
          : `${fmtInt(c.widget_handoffs)} of ${plural(c.widget_views, 'visitor', 'visitors')} went on to DesignMyNight’s checkout`,
    },
  ];

  return (
    <div className="dmn-admin__kpis">
      <p className="dmn-admin__help dmn-admin__flush">
        Compared with the previous {plural(period.days, 'day', 'days')},{' '}
        {fmtFullDay(period.previous_from)} to {fmtFullDay(period.previous_to)}.
      </p>
      <dl className="dmn-admin__stats">
        {kpis.map((k) => (
          <div key={k.key} className="dmn-admin__stat">
            <dt>{k.label}</dt>
            <dd>
              <span className="dmn-admin__kpi-value">{k.value}</span>
              <Comparison kpi={k} />
              {k.note && <span className="dmn-admin__kpi-note">{k.note}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Comparison({ kpi }: { kpi: Kpi }) {
  if (kpi.previous == null || kpi.current == null) {
    return <span className="dmn-admin__kpi-change">No figure to compare</span>;
  }
  const was = `previous period ${kpi.formatPrevious(kpi.previous)}`;
  const delta = change(kpi.current, kpi.previous);
  if (kpi.current === kpi.previous || (delta != null && Math.abs(delta) < 0.0005)) {
    return (
      <span className="dmn-admin__kpi-change">
        <Minus aria-hidden="true" />
        No change ({was})
      </span>
    );
  }
  const up = kpi.current > kpi.previous;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="dmn-admin__kpi-change">
      <Icon aria-hidden="true" />
      {delta == null ? (up ? 'Up' : 'Down') : `${up ? 'Up' : 'Down'} ${fmtPct(Math.abs(delta))}`} (
      {was})
    </span>
  );
}
