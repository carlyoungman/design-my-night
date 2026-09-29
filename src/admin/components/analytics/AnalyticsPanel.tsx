// src/admin/components/analytics/AnalyticsPanel.tsx
// The Analytics section: bookings copied from DesignMyNight (BookingSync, hourly or on "Refresh
// bookings") and anonymous booking widget activity, filtered by period, venue and activity.
// Opening it reads the plugin's own tables only; "Refresh bookings" is the one DMN request.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import {
  type AnalyticsFilters,
  type AnalyticsReport,
  type SyncState,
  analyticsExport,
  analyticsReport,
  analyticsSync,
} from '@admin/api';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { ANALYTICS_TABS, type AnalyticsTab, useAdmin } from '@admin/AdminContext';
import {
  FieldError,
  LoadError,
  StatusMessage,
  errorMessage,
  useLatestRequest,
  Skeleton,
} from '@admin/components/ui';
import { useToast } from '@admin/components/Toasts';
import KpiRow from './KpiRow';
import TrendChart from './TrendChart';
import FunnelCard from './FunnelCard';
import { Distribution, Heatmap } from './TimingCharts';
import BookingsTable from './BookingsTable';
import AnalyticsSettings from './AnalyticsSettings';
import { BarTable, ChartCard, EmptyChart } from './parts';
import {
  PRESETS,
  type RangePreset,
  addDays,
  defaultFilters,
  downloadCsv,
  fmtDateTime,
  fmtDayRange,
  fmtFullDay,
  plural,
  presetRange,
} from './format';

/** Longest custom range, matching the server's limit in Analytics::filters(). */
const MAX_RANGE_DAYS = 3 * 366;

const analyticsTabId = (id: AnalyticsTab) => `dmn-analytics-tab-${id}`;
const analyticsPanelId = (id: AnalyticsTab) => `dmn-analytics-panel-${id}`;

export default function AnalyticsPanel({ onDirty }: { onDirty?: (dirty: boolean) => void }) {
  const { section, dataVersion, analyticsTab, openAnalyticsTab, openSettingsTab } = useAdmin();
  const [settingsDirty, setSettingsDirty] = useState(false);
  const setDirty = useCallback(
    (dirty: boolean) => {
      setSettingsDirty(dirty);
      onDirty?.(dirty);
    },
    [onDirty],
  );
  const [bookingsOpened, setBookingsOpened] = useState(false);
  useEffect(() => {
    if (section === 'analytics' && analyticsTab === 'bookings') setBookingsOpened(true);
  }, [section, analyticsTab]);
  const active = section === 'analytics';
  const [opened, setOpened] = useState(active);
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultFilters);
  const [preset, setPreset] = useState<RangePreset>('30');
  const [custom, setCustom] = useState({ from: filters.from, to: filters.to });
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Bumped after a sync or settings change, so the report and table reload.
  const [version, setVersion] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const isCurrent = useLatestRequest();
  const syncToast = useToast();
  const exportToast = useToast();

  // Load when the section is first opened, not with the rest of the admin.
  useEffect(() => {
    if (active) setOpened(true);
  }, [active]);

  useEffect(() => {
    if (!opened) return;
    const current = isCurrent();
    setLoading(true);
    setError(null);
    analyticsReport(filters)
      .then((r) => current() && setReport(r))
      .catch((e) => current() && setError(errorMessage(e, 'Analytics could not be loaded.')))
      .finally(() => current() && setLoading(false));
  }, [opened, filters, version, dataVersion, isCurrent]);

  const reload = useCallback(() => setVersion((n) => n + 1), []);
  const filtered = filters.venue !== '' || filters.type !== '';
  const clearFilters = useCallback(() => setFilters((f) => ({ ...f, venue: '', type: '' })), []);

  const choosePreset = (next: RangePreset) => {
    setPreset(next);
    setRangeError(null);
    if (next === 'custom') {
      setCustom({ from: filters.from, to: filters.to });
      return;
    }
    setFilters((f) => ({ ...f, ...presetRange(next) }));
  };

  /** Shows a custom range, clamped to the longest the server accepts (ending at `to`). */
  const showRange = (from: string, to: string) => {
    const earliest = addDays(to, -(MAX_RANGE_DAYS - 1));
    const range = { from: from < earliest ? earliest : from, to };
    setPreset('custom');
    setCustom(range);
    setRangeError(null);
    setFilters((f) => ({ ...f, ...range }));
  };

  const changeCustom = (key: 'from' | 'to', value: string) => {
    const next = { ...custom, [key]: value };
    setCustom(next);
    if (!next.from || !next.to) {
      setRangeError('Enter a start and end date.');
    } else if (next.from > next.to) {
      setRangeError('The end date must be on or after the start date.');
    } else if (addDays(next.from, MAX_RANGE_DAYS) <= next.to) {
      setRangeError('Choose a range of three years or less.');
    } else {
      setRangeError(null);
      setFilters((f) => ({ ...f, ...next }));
    }
  };

  const sync = async () => {
    setSyncing(true);
    syncToast.clear();
    try {
      const s = await analyticsSync();
      syncToast.success('Bookings updated.', {
        description: s.complete
          ? `${plural(s.count, 'booking', 'bookings')} loaded from DesignMyNight.`
          : `${plural(s.count, 'booking', 'bookings')} loaded. Older bookings keep loading with the hourly update.`,
      });
    } catch (e) {
      syncToast.error('Bookings couldn’t be loaded from DesignMyNight', {
        error: e,
        action: { label: 'Try again', onClick: sync },
      });
    } finally {
      setSyncing(false);
      reload();
    }
  };

  const exportTrend = async () => {
    setExporting(true);
    exportToast.clear();
    try {
      const r = await analyticsExport(filters, 'timeseries');
      downloadCsv(r.filename, r.csv);
      exportToast.success('Trend exported.', { description: r.filename });
    } catch (e) {
      exportToast.error('The trend couldn’t be exported', {
        error: e,
        action: { label: 'Try again', onClick: exportTrend },
      });
    } finally {
      setExporting(false);
    }
  };

  // Activities for the chosen venue, or every activity once. Venues can share a DMN booking type,
  // and different types can share a name, so a repeated name gets its venue added.
  const venueTypes = useMemo(() => {
    const venueName = new Map((report?.options.venues ?? []).map((v) => [v.id, v.name]));
    const seen = new Set<string>();
    const list = (report?.options.types ?? []).filter((t) => {
      if (filters.venue ? t.venue_id !== filters.venue : seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
    const count = new Map<string, number>();
    list.forEach((t) => count.set(t.name, (count.get(t.name) ?? 0) + 1));
    return list.map((t) => ({
      id: t.id,
      label:
        (count.get(t.name) ?? 0) > 1 && venueName.has(t.venue_id)
          ? `${t.name} (${venueName.get(t.venue_id)})`
          : t.name,
    }));
  }, [report, filters.venue]);

  if (!opened) return null;

  const data = report?.data;
  const noData = !!data && data.bookings_stored === 0 && data.events_stored === 0;
  const summary = report?.summary;

  const onReportTab = analyticsTab !== 'bookings' && analyticsTab !== 'settings';

  /** Load, error and "no data yet" states shared by the tabs built from the report. */
  const reportState = (): React.ReactNode => {
    if (error) return <LoadError message={error} onRetry={reload} />;
    if (!report) return <Skeleton layout="report" label="Loading analytics…" />;
    if (noData)
      return (
        <div className="dmn-admin__empty">
          <p>
            <strong>No analytics yet.</strong> Bookings appear once they are loaded from
            DesignMyNight, and widget activity once visitors use your booking widget.
          </p>
          <button
            type="button"
            className="button button--secondary"
            onClick={sync}
            disabled={syncing}
          >
            Load bookings now
          </button>
        </div>
      );
    return null;
  };

  const tabContent = (): React.ReactNode => {
    if (!report || !summary) return null;
    switch (analyticsTab) {
      case 'overview':
        return (
          <>
            <div className="dmn-admin__analytics-wide">
              <KpiRow summary={summary} hasValue={report.data.has_value} />
            </div>
            <ChartCard
              id="dmn-an-trend"
              wide
              title="Trend"
              description={
                report.timeseries.interval === 'week'
                  ? `Weekly totals, in 7-day blocks from the start of the period.${
                      report.timeseries.last_days < 7
                        ? ` The last block covers only ${plural(report.timeseries.last_days, 'day', 'days')}.`
                        : ''
                    }`
                  : 'Daily totals.'
              }
              actions={
                <button
                  type="button"
                  className="button button--text"
                  onClick={exportTrend}
                  disabled={exporting}
                >
                  <Download aria-hidden="true" />
                  {exporting ? 'Exporting…' : 'Export CSV'}
                </button>
              }
            >
              <TrendChart
                series={report.timeseries}
                hasValue={report.data.has_value}
                filtered={filtered}
                onClearFilters={clearFilters}
              />
            </ChartCard>
          </>
        );
      case 'funnel':
        return (
          <ChartCard
            id="dmn-an-funnel"
            wide
            title="Booking widget funnel"
            description="Visitors reaching each step, by the day of their activity."
          >
            <FunnelCard
              funnel={report.funnel}
              tracking={report.data.tracking}
              filtered={filtered}
              onClearFilters={clearFilters}
            />
          </ChartCard>
        );
      case 'breakdown':
        return (
          <>
            <ChartCard id="dmn-an-venues" title="By venue" description="Top 15 venues by bookings.">
              {report.breakdown.venues.length === 0 ? (
                <EmptyChart filtered={filtered} onClearFilters={clearFilters}>
                  No bookings in this period.
                </EmptyChart>
              ) : (
                <BarTable
                  caption="Bookings by venue"
                  label="Venue"
                  showValue={report.data.has_value}
                  rows={report.breakdown.venues}
                />
              )}
            </ChartCard>
            <ChartCard
              id="dmn-an-types"
              title="By activity"
              description="Top 15 activities by bookings."
            >
              {report.breakdown.types.length === 0 ? (
                <EmptyChart filtered={filtered} onClearFilters={clearFilters}>
                  No bookings in this period.
                </EmptyChart>
              ) : (
                <BarTable
                  caption="Bookings by activity"
                  label="Activity"
                  showValue={report.data.has_value}
                  rows={report.breakdown.types}
                />
              )}
            </ChartCard>
            <ChartCard
              id="dmn-an-statuses"
              title="By status"
              description="Every booking, including those left out of the totals."
            >
              {report.breakdown.statuses.length === 0 ? (
                <EmptyChart filtered={filtered} onClearFilters={clearFilters}>
                  No bookings in this period.
                </EmptyChart>
              ) : (
                <BarTable
                  caption="Bookings by status"
                  label="Status"
                  showValue={false}
                  rows={report.breakdown.statuses.map((r) => ({
                    ...r,
                    note: r.inactive ? 'not counted in totals' : undefined,
                  }))}
                />
              )}
            </ChartCard>
            <ChartCard
              id="dmn-an-sources"
              title="By source"
              description="Where bookings were made; excludes rejected, lost and deleted ones."
            >
              {report.breakdown.sources.length === 0 ? (
                <EmptyChart filtered={filtered} onClearFilters={clearFilters}>
                  No bookings in this period.
                </EmptyChart>
              ) : (
                <BarTable
                  caption="Bookings by source"
                  label="Source"
                  showValue={false}
                  rows={report.breakdown.sources}
                />
              )}
            </ChartCard>
          </>
        );
      case 'timing':
        return (
          <>
            <ChartCard
              id="dmn-an-heatmap"
              wide
              title="Busiest days and times"
              description="Bookings by the day and hour they start."
            >
              <Heatmap
                cells={report.timing.heatmap}
                filtered={filtered}
                onClearFilters={clearFilters}
              />
            </ChartCard>
            <ChartCard
              id="dmn-an-lead"
              title="How far ahead people book"
              description="Days between making the booking and the visit."
            >
              <Distribution
                rows={report.timing.lead_time}
                caption="Bookings by how far ahead they were made"
                label="Booked ahead"
                filtered={filtered}
                onClearFilters={clearFilters}
              />
            </ChartCard>
            <ChartCard id="dmn-an-size" title="Group sizes" description="Guests per booking.">
              <Distribution
                rows={report.timing.group_size}
                caption="Bookings by group size"
                label="Guests"
                filtered={filtered}
                onClearFilters={clearFilters}
              />
            </ChartCard>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <section className="dmn-admin__section" aria-labelledby="dmn-admin-analytics-title">
      <div className="dmn-admin__section-header">
        <div>
          <h2 id="dmn-admin-analytics-title">Analytics</h2>
          <p className="dmn-admin__help">
            Bookings for your venues from DesignMyNight, and how visitors use your booking widget.
          </p>
        </div>
        <div className="dmn-admin__section-actions">
          <button type="button" className="button" onClick={sync} disabled={syncing}>
            <RefreshCw aria-hidden="true" className={syncing ? 'dmn-admin__spin' : undefined} />
            {syncing ? 'Refreshing…' : 'Refresh bookings'}
          </button>
        </div>
      </div>

      <nav className="dmn-admin__nav dmn-admin__nav--secondary" aria-label="Analytics views">
        <Tabs
          value={analyticsTab}
          onChange={(_, id: AnalyticsTab) => openAnalyticsTab(id)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {ANALYTICS_TABS.map((t) => (
            <Tab
              key={t.id}
              value={t.id}
              id={analyticsTabId(t.id)}
              aria-controls={analyticsPanelId(t.id)}
              disableRipple
              label={
                <span className="dmn-admin__nav-label">
                  {t.label}
                  {t.id === 'settings' && settingsDirty && (
                    <>
                      <span className="dmn-admin__nav-dot" aria-hidden="true" />
                      <span className="screen-reader-text"> (unsaved changes)</span>
                    </>
                  )}
                </span>
              }
            />
          ))}
        </Tabs>
      </nav>

      {analyticsTab !== 'settings' && (
        <>
          <form
            className="dmn-admin__card dmn-admin__analytics-filters"
            aria-label="Filters"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="dmn-admin__field">
              <label htmlFor="dmn-an-range">Period</label>
              <select
                id="dmn-an-range"
                value={preset}
                onChange={(e) => choosePreset(e.target.value as RangePreset)}
              >
                {PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            {preset === 'custom' && (
              <fieldset className="dmn-admin__field dmn-admin__analytics-custom">
                <legend className="screen-reader-text">Custom range</legend>
                <div className="dmn-admin__field">
                  <label htmlFor="dmn-an-from">From</label>
                  <input
                    id="dmn-an-from"
                    type="date"
                    value={custom.from}
                    max={custom.to || undefined}
                    onChange={(e) => changeCustom('from', e.target.value)}
                    aria-invalid={!!rangeError}
                    aria-describedby={rangeError ? 'dmn-an-range-error' : undefined}
                  />
                </div>
                <div className="dmn-admin__field">
                  <label htmlFor="dmn-an-to">To</label>
                  <input
                    id="dmn-an-to"
                    type="date"
                    value={custom.to}
                    min={custom.from || undefined}
                    onChange={(e) => changeCustom('to', e.target.value)}
                    aria-invalid={!!rangeError}
                    aria-describedby={rangeError ? 'dmn-an-range-error' : undefined}
                  />
                </div>
                {rangeError && <FieldError id="dmn-an-range-error">{rangeError}</FieldError>}
              </fieldset>
            )}
            <div className="dmn-admin__field">
              <label htmlFor="dmn-an-basis">Count bookings by</label>
              <select
                id="dmn-an-basis"
                value={filters.basis}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, basis: e.target.value as AnalyticsFilters['basis'] }))
                }
              >
                <option value="created">Date booked</option>
                <option value="visit">Date of visit</option>
              </select>
            </div>
            <div className="dmn-admin__field">
              <label htmlFor="dmn-an-venue">Venue</label>
              <select
                id="dmn-an-venue"
                value={filters.venue}
                onChange={(e) => setFilters((f) => ({ ...f, venue: e.target.value, type: '' }))}
              >
                <option value="">All venues</option>
                {(report?.options.venues ?? []).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="dmn-admin__field">
              <label htmlFor="dmn-an-type">Activity</label>
              <select
                id="dmn-an-type"
                value={filters.type}
                onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="">All activities</option>
                {venueTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            {filtered && (
              <div className="dmn-admin__analytics-clear">
                <button type="button" className="button button--text" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            )}
            <p className="dmn-admin__help dmn-admin__analytics-period" role="status">
              {fmtFullDay(filters.from)} to {fmtFullDay(filters.to)}
              {loading && report && ' (updating…)'}
            </p>
          </form>
          {data && (
            <DataNotices
              data={data}
              onSync={sync}
              syncing={syncing}
              openConnection={() => openSettingsTab('connection')}
              openSettings={() => openAnalyticsTab('settings')}
            />
          )}
          {report && !filtered && <PeriodNotice report={report} onShowRange={showRange} />}
        </>
      )}

      {onReportTab && (
        <div
          id={analyticsPanelId(analyticsTab)}
          role="tabpanel"
          aria-labelledby={analyticsTabId(analyticsTab)}
          className="dmn-admin__analytics"
          aria-busy={loading}
        >
          {reportState() ?? tabContent()}
        </div>
      )}

      {/* Kept mounted once opened, so the table keeps its page and sort. */}
      {bookingsOpened && (
        <div
          id={analyticsPanelId('bookings')}
          role="tabpanel"
          aria-labelledby={analyticsTabId('bookings')}
          hidden={analyticsTab !== 'bookings'}
        >
          <BookingsTable
            filters={filters}
            hasValue={report?.data.has_value ?? true}
            version={version + dataVersion}
            filtered={filtered}
            onClearFilters={clearFilters}
          />
        </div>
      )}

      {/* Always mounted, so unsaved settings survive switching tab. */}
      <div
        id={analyticsPanelId('settings')}
        role="tabpanel"
        aria-labelledby={analyticsTabId('settings')}
        hidden={analyticsTab !== 'settings'}
      >
        <AnalyticsSettings onSaved={reload} onDirty={setDirty} />
      </div>
    </section>
  );
}

/**
 * Bookings are stored but none fall in the chosen period (for example they were all made more
 * than 30 days ago): say when they were made or take place, with a button to show those dates.
 * Venue and activity filters have their own empty state, so this is only for the period.
 */
function PeriodNotice({
  report,
  onShowRange,
}: {
  report: AnalyticsReport;
  onShowRange: (from: string, to: string) => void;
}) {
  const { data, summary, filters } = report;
  if (data.bookings_stored === 0 || summary.current.bookings > 0) return null;
  const visit = filters.basis === 'visit';
  const from = visit ? data.range.visit_from : data.range.created_from;
  const to = visit ? data.range.visit_to : data.range.created_to;
  // Only when every stored booking lies outside the period. If the period holds some that don't
  // count in the totals (rejected, lost or deleted), the Bookings tab shows them and this would
  // point back at the same dates.
  if (!from || !to || (to >= filters.from && from <= filters.to)) return null;
  const period =
    filters.from === filters.to
      ? fmtFullDay(filters.from)
      : `${fmtFullDay(filters.from)} to ${fmtFullDay(filters.to)}`;
  return (
    <div className="dmn-admin__analytics-notices">
      <div className="actions">
        <StatusMessage tone="warning">
          {visit
            ? `No bookings take place in this period (${period}). Your stored ${data.bookings_stored === 1 ? 'booking takes place' : 'bookings take place'} ${fmtDayRange(from, to)}.`
            : `No bookings were made in this period (${period}). Your stored ${data.bookings_stored === 1 ? 'booking was made' : 'bookings were made'} ${fmtDayRange(from, to)}.`}
        </StatusMessage>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => onShowRange(from, to)}
        >
          Show those dates
        </button>
      </div>
    </div>
  );
}

/** Where the figures come from, and anything stopping them from being complete. */
function DataNotices({
  data,
  onSync,
  syncing,
  openConnection,
  openSettings,
}: {
  data: AnalyticsReport['data'];
  onSync: () => void;
  syncing: boolean;
  openConnection: () => void;
  openSettings: () => void;
}) {
  const s: SyncState = data.sync;
  const notices: React.ReactNode[] = [];

  if (s.error_code === 'no_credentials' || s.error_code === 'bad_credentials') {
    notices.push(
      <div key="cred" className="actions">
        <StatusMessage tone="warning">{s.error}</StatusMessage>
        <button type="button" className="button button--text" onClick={openConnection}>
          Go to Connection
        </button>
      </div>,
    );
  } else if (s.error_code === 'no_venues') {
    notices.push(
      <div key="venues" className="actions">
        <StatusMessage tone="warning">{s.error}</StatusMessage>
        <button type="button" className="button button--text" onClick={openConnection}>
          Go to Connection
        </button>
      </div>,
    );
  } else if (s.error_code === 'no_permission') {
    notices.push(
      <StatusMessage key="perm" tone="warning">
        {s.error} Until then, only booking widget activity is shown.
      </StatusMessage>,
    );
  } else if (s.ok === false && s.error) {
    notices.push(
      <StatusMessage key="err" tone="error">
        The last update from DesignMyNight failed: {s.error}
      </StatusMessage>,
    );
  }

  if (s.finished_at == null && !s.error_code) {
    notices.push(
      <div key="never" className="actions">
        <StatusMessage tone="warning">
          Bookings haven’t been loaded from DesignMyNight yet.
        </StatusMessage>
        <button type="button" className="button button--text" onClick={onSync} disabled={syncing}>
          Load bookings now
        </button>
      </div>,
    );
  } else if (s.ok && !s.complete) {
    notices.push(
      <StatusMessage key="partial" tone="warning">
        Older bookings are still loading. The rest arrive with the hourly update, or use Refresh
        bookings.
      </StatusMessage>,
    );
  }

  if (!data.tracking) {
    notices.push(
      <div key="track" className="actions">
        <StatusMessage tone="warning">
          Widget activity isn’t being recorded, so the funnel and conversion only cover earlier
          activity.
        </StatusMessage>
        <button type="button" className="button button--text" onClick={openSettings}>
          Open settings
        </button>
      </div>,
    );
  }

  return (
    <div className="dmn-admin__analytics-notices">
      {notices}
      <p className="dmn-admin__help dmn-admin__flush">
        {s.last_success_at
          ? `Bookings last updated ${fmtDateTime(new Date(s.last_success_at * 1000).toISOString())}; they update hourly.`
          : 'Bookings update hourly once loaded.'}{' '}
        {data.retention_days > 0
          ? `Data older than ${plural(data.retention_days, 'day', 'days')} is deleted.`
          : 'Data is kept until you delete it.'}
      </p>
    </div>
  );
}
