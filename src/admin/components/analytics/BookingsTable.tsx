// Bookings matching the filters, every status included, sortable and paginated, with CSV export.
// Customer details are never stored, so rows show the booking reference instead of a name.
import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Download } from 'lucide-react';
import {
  type AnalyticsBooking,
  type AnalyticsFilters,
  type BookingSort,
  analyticsBookings,
  analyticsExport,
} from '@admin/api';
import { LoadError, Loading, errorMessage, useLatestRequest } from '@admin/components/ui';
import { useToast } from '@admin/components/Toasts';
import { EmptyChart } from './parts';
import { downloadCsv, fmtDateTime, fmtFullDay, fmtInt, fmtMoney } from './format';

const PER_PAGE = [25, 50, 100];

const COLUMNS: { key: string; label: string; sort?: BookingSort; num?: boolean }[] = [
  { key: 'reference', label: 'Reference' },
  { key: 'venue', label: 'Venue and activity' },
  { key: 'date', label: 'Date and time', sort: 'booking_date' },
  { key: 'guests', label: 'Guests', sort: 'num_people', num: true },
  { key: 'status', label: 'Status', sort: 'status' },
  { key: 'value', label: 'Value', sort: 'value', num: true },
  { key: 'deposit', label: 'Deposits', sort: 'deposit', num: true },
  { key: 'created', label: 'Booked on', sort: 'created_date' },
];

export default function BookingsTable({
  filters,
  hasValue,
  version,
  filtered,
  onClearFilters,
}: {
  filters: AnalyticsFilters;
  /** Shows the Value column only when DesignMyNight sends booking values. */
  hasValue: boolean;
  /** Changes when the data may have changed, such as after a sync. */
  version: number;
  filtered: boolean;
  onClearFilters: () => void;
}) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sort, setSort] = useState<BookingSort>('created_date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [items, setItems] = useState<AnalyticsBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [exporting, setExporting] = useState(false);
  const isCurrent = useLatestRequest();
  const exportToast = useToast();

  // A new filter starts again from the first page.
  useEffect(() => setPage(1), [filters]);

  useEffect(() => {
    const current = isCurrent();
    setLoading(true);
    setError(null);
    analyticsBookings(filters, { page, per_page: perPage, sort, order })
      .then((r) => {
        if (!current()) return;
        // Fewer bookings than before (after a refresh or a shorter retention period): go to
        // the last page that still exists.
        const lastPage = Math.max(1, Math.ceil(r.total / perPage));
        if (page > lastPage) {
          setPage(lastPage);
          return;
        }
        setItems(r.items);
        setTotal(r.total);
      })
      .catch((e) => current() && setError(errorMessage(e, 'Bookings could not be loaded.')))
      .finally(() => current() && setLoading(false));
  }, [filters, page, perPage, sort, order, version, attempt, isCurrent]);

  const sortBy = (key: BookingSort) => {
    if (key === sort) setOrder(order === 'asc' ? 'desc' : 'asc');
    else {
      setSort(key);
      setOrder(key === 'status' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  const exportCsv = async () => {
    setExporting(true);
    exportToast.clear();
    try {
      const r = await analyticsExport(filters, 'bookings');
      downloadCsv(r.filename, r.csv);
      if (r.rows < r.total)
        exportToast.error('Only part of the bookings was exported', {
          description: `${r.filename} has the newest ${fmtInt(r.rows)} of ${fmtInt(r.total)} bookings. Choose a shorter period to export the rest.`,
        });
      else exportToast.success('Bookings exported.', { description: r.filename });
    } catch (e) {
      exportToast.error('Bookings couldn’t be exported', {
        error: e,
        action: { label: 'Try again', onClick: exportCsv },
      });
    } finally {
      setExporting(false);
    }
  };

  const columns = COLUMNS.filter((c) => hasValue || c.key !== 'value');
  const pages = Math.max(1, Math.ceil(total / perPage));
  const first = total === 0 ? 0 : (page - 1) * perPage + 1;
  const last = Math.min(total, page * perPage);

  return (
    <section
      className="dmn-admin__card dmn-admin__analytics-wide"
      aria-labelledby="dmn-bookings-title"
    >
      <div className="dmn-admin__card-header--split dmn-admin__spacer-bottom">
        <div>
          <h3 id="dmn-bookings-title" className="dmn-admin__flush">
            Bookings
          </h3>
          <p className="dmn-admin__help dmn-admin__flush">
            Every status, including rejected, lost and deleted. Customer details stay in
            DesignMyNight.
          </p>
        </div>
        <div className="actions">
          <button
            type="button"
            className="button button--secondary"
            onClick={exportCsv}
            disabled={exporting || total === 0}
            aria-disabled={exporting || total === 0}
          >
            <Download aria-hidden="true" />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {error ? (
        <LoadError message={error} onRetry={() => setAttempt((n) => n + 1)} />
      ) : loading && items.length === 0 ? (
        <Loading>Loading bookings…</Loading>
      ) : total === 0 ? (
        <EmptyChart filtered={filtered} onClearFilters={onClearFilters}>
          No bookings in this period.
        </EmptyChart>
      ) : (
        <>
          <div
            className="dmn-admin__table-wrap"
            role="region"
            aria-labelledby="dmn-bookings-title"
            aria-busy={loading}
            tabIndex={0}
          >
            <table className="dmn-admin__table dmn-admin__bookings">
              <thead>
                <tr>
                  {columns.map((c) => {
                    const active = c.sort && c.sort === sort;
                    const ariaSort = active
                      ? order === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined;
                    const Icon = !active ? ArrowUpDown : order === 'asc' ? ArrowUp : ArrowDown;
                    return (
                      <th
                        key={c.key}
                        scope="col"
                        aria-sort={ariaSort}
                        className={c.num ? 'dmn-admin__num' : undefined}
                      >
                        {c.sort ? (
                          <button
                            type="button"
                            className="dmn-admin__sort"
                            onClick={() => sortBy(c.sort!)}
                          >
                            {c.label}
                            <Icon aria-hidden="true" />
                          </button>
                        ) : (
                          c.label
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.id}>
                    <th scope="row">
                      <code>{b.reference || b.id}</code>
                    </th>
                    <td>
                      {b.venue ?? 'Venue not imported'}
                      {b.type && <span className="dmn-admin__cell-sub">{b.type}</span>}
                    </td>
                    <td>
                      {b.date ? fmtFullDay(b.date) : '–'}
                      {b.time && <span className="dmn-admin__cell-sub">{b.time}</span>}
                    </td>
                    <td className="dmn-admin__num">{fmtInt(b.num_people)}</td>
                    <td>{b.status_label}</td>
                    {hasValue && (
                      <td className="dmn-admin__num">
                        {b.value != null ? fmtMoney(b.value) : '–'}
                      </td>
                    )}
                    <td className="dmn-admin__num">
                      {b.deposit != null ? fmtMoney(b.deposit) : '–'}
                    </td>
                    <td>{b.created ? fmtDateTime(b.created) : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dmn-admin__pager">
            <p className="dmn-admin__help dmn-admin__flush" role="status">
              {fmtInt(first)}–{fmtInt(last)} of {fmtInt(total)}
              {loading && ' (updating…)'}
            </p>
            <div className="dmn-admin__field dmn-admin__pager-size">
              <label htmlFor="dmn-bookings-per-page">Rows per page</label>
              <select
                id="dmn-bookings-per-page"
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                {PER_PAGE.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="actions">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1 || loading}
              >
                Previous
              </button>
              <span className="dmn-admin__help">
                Page {page} of {pages}
              </span>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setPage(page + 1)}
                disabled={page >= pages || loading}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
