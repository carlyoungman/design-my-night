// Building blocks shared by the Analytics cards: the card frame, the "show as table" alternative
// for charts, bar tables for categories, and empty states.
import React from 'react';
import { fmtInt, fmtMoney } from './format';

/** A titled card. `actions` sit on the right of the title (for example an export button). */
export function ChartCard({
  id,
  title,
  description,
  actions,
  wide = false,
  children,
}: {
  id: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`dmn-admin__card dmn-admin__analytics-card${wide ? ' dmn-admin__analytics-wide' : ''}`}
      aria-labelledby={`${id}-title`}
    >
      <div className="dmn-admin__card-header--split">
        <div>
          <h3 id={`${id}-title`} className="dmn-admin__flush">
            {title}
          </h3>
          {description && <p className="dmn-admin__help dmn-admin__flush">{description}</p>}
        </div>
        {actions && <div className="actions">{actions}</div>}
      </div>
      <div className="dmn-admin__analytics-body">{children}</div>
    </section>
  );
}

/** The figures behind a chart as a table, for screen readers and anyone wanting exact values. */
export function DataDisclosure({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    <details className="dmn-admin__analytics-data">
      <summary>Show as a table</summary>
      <div className="dmn-admin__table-wrap" role="region" aria-label={caption} tabIndex={0}>
        <table className="dmn-admin__table">
          <caption className="screen-reader-text">{caption}</caption>
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={c} scope="col" className={i > 0 ? 'dmn-admin__num' : undefined}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) =>
                  j === 0 ? (
                    <th key={j} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={j} className="dmn-admin__num">
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export type BarRow = {
  key: string;
  label: string;
  bookings: number;
  covers?: number;
  value?: number | null;
  /** Shown muted with a note, such as rejected or deleted bookings. */
  note?: string;
};

/**
 * Categories as a table with an inline bar for bookings, so long names stay readable and exact
 * values are always visible.
 */
export function BarTable({
  caption,
  label,
  rows,
  showCovers = true,
  showValue = true,
}: {
  caption: string;
  label: string;
  rows: BarRow[];
  showCovers?: boolean;
  showValue?: boolean;
}) {
  const max = Math.max(1, ...rows.map((r) => r.bookings));
  return (
    <div
      className="dmn-admin__table-wrap dmn-admin__bar-table"
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table className="dmn-admin__table">
        <caption className="screen-reader-text">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{label}</th>
            <th scope="col" className="dmn-admin__num">
              Bookings
            </th>
            {showCovers && (
              <th scope="col" className="dmn-admin__num">
                Guests
              </th>
            )}
            {showValue && (
              <th scope="col" className="dmn-admin__num">
                Value
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className={r.note ? 'dmn-admin__bar-row--muted' : undefined}>
              <th scope="row">
                {r.label}
                {r.note && <span className="dmn-admin__bar-note"> ({r.note})</span>}
              </th>
              <td className="dmn-admin__num">
                <span className="dmn-admin__bar-cell">
                  <span className="dmn-admin__bar" aria-hidden="true">
                    <span style={{ width: `${(r.bookings / max) * 100}%` }} />
                  </span>
                  {fmtInt(r.bookings)}
                </span>
              </td>
              {showCovers && <td className="dmn-admin__num">{fmtInt(r.covers ?? 0)}</td>}
              {showValue && (
                <td className="dmn-admin__num">{r.value != null ? fmtMoney(r.value) : '–'}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Nothing to show for the current filters, with a way out when filters are narrowing it. */
export function EmptyChart({
  children,
  filtered,
  onClearFilters,
}: {
  children: React.ReactNode;
  filtered?: boolean;
  onClearFilters?: () => void;
}) {
  return (
    <div className="dmn-admin__analytics-empty">
      <p>{children}</p>
      {filtered && onClearFilters && (
        <button type="button" className="button button--text" onClick={onClearFilters}>
          Clear venue and activity filters
        </button>
      )}
    </div>
  );
}
