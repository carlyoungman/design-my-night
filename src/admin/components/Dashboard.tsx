// src/admin/components/Dashboard.tsx
// The plugin's first screen, in order of what needs doing: setup steps until the plugin is
// connected and imported, then anything that needs attention, the totals, the last 30 days of
// bookings, and the status of the last import and the connection. Everything shown comes from the
// plugin's own data (see dmn_admin_overview and dmn_admin_list_venues); opening the dashboard
// makes no DMN request.
import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock,
  EyeOff,
  ImageOff,
  PackageOpen,
  PlugZap,
} from 'lucide-react';
import { type AnalyticsSummary, analyticsSummary } from '@admin/api';
import { defaultFilters, fmtFullDay, fmtInt, fmtPct } from '@admin/components/analytics/format';
import { useAdmin, venueHref } from '@admin/AdminContext';
import { useOverview, useVenues } from '@admin/data';
import ImportStatus, {
  STALE_AFTER_DAYS,
  dataEnvironment,
  envLabel,
  plural,
  staleDays,
} from '@admin/components/ImportStatus';
import { LoadError, Loading, StatusMessage, errorMessage } from '@admin/components/ui';

type AttentionItem = { key: string; icon: React.ReactNode; content: React.ReactNode };

export default function Dashboard() {
  const { section, goToSection, openVenue, openSettingsTab } = useAdmin();
  const active = section === 'dashboard';
  // Shared with the other sections (data.tsx), which refresh them after saves and imports, so the
  // dashboard is current whenever it is shown.
  const venuesData = useVenues();
  const overviewData = useOverview();
  const { venues } = venuesData;
  const { overview } = overviewData;
  const loading = venuesData.loading || overviewData.loading;
  const error = venuesData.error || overviewData.error;
  const retry = () => {
    if (venuesData.error) venuesData.retry();
    if (overviewData.error) overviewData.retry();
  };

  const last = overview?.last_import ?? null;
  const connection = overview?.connection;
  const totals = venues.reduce(
    (t, v) => ({
      activities: t.activities + v.activities_count,
      visible: t.visible + v.visible_count,
    }),
    { activities: 0, visible: 0 },
  );

  // Venues count as imported even without a record: imports before the record existed left none.
  const hasImported = venues.length > 0;
  const setupDone = !!connection?.has_credentials && hasImported;
  const dataEnv = dataEnvironment(last);
  const stale = last?.ok ? staleDays(last) : 0;

  const venueLink = (id: number, title: string) => (
    <a
      href={venueHref(id)}
      onClick={(e) => {
        e.preventDefault();
        openVenue(id);
      }}
    >
      {title || 'Untitled venue'}
    </a>
  );

  // What needs doing: problems with the imported data first, then venue by venue.
  const attention: AttentionItem[] = [];
  if (last && !last.ok)
    attention.push({
      key: 'import-failed',
      icon: <AlertCircle aria-hidden="true" />,
      content:
        'The last import from DesignMyNight failed, so your venues are from the last import that worked. The reason is under Last import below.',
    });
  else if (last && last.issues_count > 0)
    attention.push({
      key: 'import-issues',
      icon: <CircleDot aria-hidden="true" />,
      content: `The last import finished with ${plural(last.issues_count, 'problem', 'problems')}; they are listed under Last import below.`,
    });
  if (hasImported && stale >= STALE_AFTER_DAYS)
    attention.push({
      key: 'stale',
      icon: <Clock aria-hidden="true" />,
      content: `Imported data is ${stale} days old. Import again to pick up changes made in DesignMyNight.`,
    });
  if (hasImported && dataEnv && connection && dataEnv !== connection.environment)
    attention.push({
      key: 'environment',
      icon: <PlugZap aria-hidden="true" />,
      content: `Your venues were imported from ${envLabel(dataEnv)}, but the environment is now set to ${envLabel(connection.environment)}. Import again to load ${envLabel(connection.environment)} venues.`,
    });
  venues.forEach((v) => {
    if (v.activities_count === 0)
      attention.push({
        key: `${v.id}-none`,
        icon: <PackageOpen aria-hidden="true" />,
        content: (
          <>
            {venueLink(v.id, v.title)}: No activities imported, so it has nothing to book in the
            widget
          </>
        ),
      });
    else if (v.visible_count === 0)
      attention.push({
        key: `${v.id}-hidden`,
        icon: <EyeOff aria-hidden="true" />,
        content: (
          <>
            {venueLink(v.id, v.title)}: All{' '}
            {plural(v.activities_count, 'activity is', 'activities are')} hidden from the widget
          </>
        ),
      });
    if (v.without_image_count > 0)
      attention.push({
        key: `${v.id}-images`,
        icon: <ImageOff aria-hidden="true" />,
        content: (
          <>
            {venueLink(v.id, v.title)}:{' '}
            {plural(v.without_image_count, 'activity has', 'activities have')} no image
          </>
        ),
      });
  });

  return (
    <section className="dmn-admin__section" aria-labelledby="dmn-admin-dashboard-title">
      <div className="dmn-admin__section-header">
        <div>
          <h2 id="dmn-admin-dashboard-title">Dashboard</h2>
          <p className="dmn-admin__help">
            What needs your attention, your totals, and the state of your DesignMyNight import.
          </p>
        </div>
      </div>

      {loading && <Loading>Loading dashboard…</Loading>}
      {!loading && error && <LoadError message={error} onRetry={retry} />}

      {/* Both are needed: without the venues it would look as if nothing had been imported. A
          failed reload keeps what was loaded on screen, below its error. */}
      {!loading && overview && venuesData.loaded && (
        <div className="dmn-admin__dashboard">
          {!setupDone && (
            <div className="dmn-admin__card dmn-admin__dashboard-wide">
              <h3>Get started</h3>
              <ol className="dmn-admin__steps">
                <li className="dmn-admin__step">
                  {connection?.has_credentials ? (
                    <CheckCircle2 className="dmn-admin__chip-icon--success" aria-hidden="true" />
                  ) : (
                    <Circle aria-hidden="true" />
                  )}
                  <div>
                    <p className="dmn-admin__step-title">
                      Add your DesignMyNight API credentials
                      <span className="screen-reader-text">
                        {connection?.has_credentials ? ' (done)' : ' (to do)'}
                      </span>
                    </p>
                    {!connection?.has_credentials && (
                      <button
                        type="button"
                        className="button button--secondary"
                        onClick={() => openSettingsTab('connection')}
                      >
                        Go to Connection
                      </button>
                    )}
                  </div>
                </li>
                <li className="dmn-admin__step">
                  {hasImported ? (
                    <CheckCircle2 className="dmn-admin__chip-icon--success" aria-hidden="true" />
                  ) : (
                    <Circle aria-hidden="true" />
                  )}
                  <div>
                    <p className="dmn-admin__step-title">
                      Import your venues and activities
                      <span className="screen-reader-text">
                        {hasImported ? ' (done)' : ' (to do)'}
                      </span>
                    </p>
                    {!hasImported && connection?.has_credentials && (
                      <p className="dmn-admin__help">Use Import from DesignMyNight below.</p>
                    )}
                  </div>
                </li>
                {/* The plugin can't tell whether a page shows the widget, so this is a pointer, not a
                    step with a done state. */}
                <li className="dmn-admin__step">
                  <ArrowRight aria-hidden="true" />
                  <div>
                    <p className="dmn-admin__step-title">Next: add the booking widget to a page</p>
                    <button
                      type="button"
                      className="button button--text"
                      onClick={() => openSettingsTab('shortcode')}
                    >
                      See the shortcode
                    </button>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {(hasImported || attention.length > 0) && (
            <div className="dmn-admin__card dmn-admin__dashboard-wide">
              <div className="dmn-admin__card-header--split dmn-admin__spacer-bottom">
                <h3 className="dmn-admin__flush">Needs attention</h3>
                {hasImported && (
                  <button
                    type="button"
                    className="button button--text"
                    onClick={() => goToSection('venues')}
                  >
                    View all venues
                  </button>
                )}
              </div>
              {attention.length === 0 ? (
                <StatusMessage tone="success">
                  Nothing needs attention: the last import worked, every venue has activities shown
                  in the widget, and every activity has an image.
                </StatusMessage>
              ) : (
                <ul className="dmn-admin__attention">
                  {attention.map((a) => (
                    <li key={a.key}>
                      {a.icon}
                      <span>{a.content}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {hasImported && (
            <dl className="dmn-admin__stats dmn-admin__dashboard-wide">
              <div className="dmn-admin__stat">
                <dt>Venues</dt>
                <dd>{venues.length}</dd>
              </div>
              <div className="dmn-admin__stat">
                <dt>Activities</dt>
                <dd>{totals.activities}</dd>
              </div>
              <div className="dmn-admin__stat">
                <dt>Shown in widget</dt>
                <dd>
                  {totals.visible}
                  <span className="dmn-admin__stat-of"> of {totals.activities}</span>
                </dd>
              </div>
            </dl>
          )}

          {hasImported && <RecentBookingsCard active={active} />}

          <section className="dmn-admin__card" aria-labelledby="dmn-admin-dashboard-import">
            <h3 id="dmn-admin-dashboard-import">Last import</h3>
            {/* Its warnings are listed under Needs attention above. */}
            <ImportStatus warnings={false} />
          </section>

          <div className="dmn-admin__card">
            <h3>Connection</h3>
            <dl className="dmn-admin__facts">
              <div>
                <dt>API credentials</dt>
                <dd>
                  {connection?.has_credentials ? (
                    <StatusMessage tone="success">Saved</StatusMessage>
                  ) : (
                    <StatusMessage tone="warning">Not saved</StatusMessage>
                  )}
                </dd>
              </div>
              <div>
                <dt>Environment</dt>
                <dd>{connection ? envLabel(connection.environment) : '–'}</dd>
              </div>
              <div>
                <dt>Venue group</dt>
                <dd>{connection?.venue_group || 'Not set'}</dd>
              </div>
            </dl>
            <div className="actions dmn-admin__spacer-top">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => openSettingsTab('connection')}
              >
                Manage connection
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * The last 30 days from Analytics: bookings, guests and widget conversion. Reads the plugin's
 * own tables (GET dmn/v1/admin/analytics/summary), so it makes no DesignMyNight request.
 */
function RecentBookingsCard({ active }: { active: boolean }) {
  const { dataVersion, goToSection } = useAdmin();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  // Day the latest stored booking was made, to explain an empty 30 days.
  const [latest, setLatest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!active) return;
    let cancel = false;
    setError(null);
    analyticsSummary(defaultFilters())
      .then((r) => {
        if (cancel) return;
        setSummary(r.summary);
        setLatest(r.data.range?.created_to ?? null);
      })
      .catch((e) => !cancel && setError(errorMessage(e, 'Recent bookings could not be loaded.')));
    return () => {
      cancel = true;
    };
  }, [active, dataVersion, attempt]);

  const c = summary?.current;
  // Stored bookings, but none made in the last 30 days: say when the latest was made.
  const olderOnly =
    !!c && c.bookings === 0 && !!latest && !!summary && latest < summary.period.from;
  return (
    <div className="dmn-admin__card dmn-admin__dashboard-wide">
      <div className="dmn-admin__card-header--split dmn-admin__spacer-bottom">
        <h3 className="dmn-admin__flush">Last 30 days</h3>
        <button
          type="button"
          className="button button--text"
          onClick={() => goToSection('analytics')}
        >
          View analytics
        </button>
      </div>
      {error ? (
        <LoadError message={error} onRetry={() => setAttempt((n) => n + 1)} />
      ) : !c ? (
        <Loading>Loading recent bookings…</Loading>
      ) : (
        <dl className="dmn-admin__stats dmn-admin__flush">
          <div className="dmn-admin__stat">
            <dt>Bookings made</dt>
            <dd>{fmtInt(c.bookings)}</dd>
          </div>
          <div className="dmn-admin__stat">
            <dt>Guests</dt>
            <dd>{fmtInt(c.covers)}</dd>
          </div>
          <div className="dmn-admin__stat">
            <dt>Widget visitors sent to checkout</dt>
            <dd>
              {fmtInt(c.widget_handoffs)}
              {c.conversion != null && (
                <span className="dmn-admin__stat-of"> ({fmtPct(c.conversion)} of visitors)</span>
              )}
            </dd>
          </div>
        </dl>
      )}
      {!error && olderOnly && latest && (
        <p className="dmn-admin__help dmn-admin__spacer-top dmn-admin__flush">
          No bookings were made in the last 30 days. The latest was made on {fmtFullDay(latest)};
          see them in Analytics.
        </p>
      )}
    </div>
  );
}
