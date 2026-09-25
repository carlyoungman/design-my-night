// src/admin/components/Dashboard.tsx
// The plugin's first screen: setup progress, the last import from DesignMyNight, totals, the
// connection, and venues that need attention. Everything shown comes from the plugin's own data
// (see dmn_admin_overview and dmn_admin_list_venues); opening the dashboard makes no DMN request.
import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  CircleDot,
  EyeOff,
  ImageOff,
  PackageOpen,
} from 'lucide-react';
import { type AdminVenue, type ImportRecord, adminListVenues, adminOverview } from '@admin/api';
import { useAdmin, venueHref } from '@admin/AdminContext';
import { LoadError, Loading, StatusMessage, errorMessage } from '@admin/components/ui';

type Overview = Awaited<ReturnType<typeof adminOverview>>;

/** Imported data older than this gets a reminder to import again. */
const STALE_AFTER_DAYS = 7;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const envLabel = (env: 'prod' | 'qa') => (env === 'qa' ? 'QA / Sandbox' : 'Production');

const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

/** "3 hours ago", "yesterday"… for a Unix timestamp in seconds. */
function ago(seconds: number, now = Date.now()): string {
  const diff = seconds - now / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(diff) >= size) return relative.format(Math.round(diff / size), unit);
  }
  return 'just now';
}

function When({ at }: { at: number }) {
  const d = new Date(at * 1000);
  return (
    <time dateTime={d.toISOString()} title={dateTime.format(d)}>
      {ago(at)} ({dateTime.format(d)})
    </time>
  );
}

function formatDuration(ms: number) {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
}

export default function Dashboard() {
  const { section, dataVersion, goToSection, openVenue } = useAdmin();
  const active = section === 'dashboard';
  const [overview, setOverview] = useState<Overview | null>(null);
  const [venues, setVenues] = useState<AdminVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (quiet: boolean) => {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const [o, v] = await Promise.all([adminOverview(), adminListVenues()]);
      setOverview(o);
      setVenues(v.venues ?? []);
    } catch (e) {
      setError(errorMessage(e, 'The dashboard could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on first view, after an import, and quietly whenever the user comes back to the
  // dashboard, since edits in other sections change what it shows.
  const loaded = overview != null;
  useEffect(() => {
    if (active) load(loaded);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `loaded` only picks quiet vs full.
  }, [active, dataVersion, load]);

  if (!active && !loaded) return null;

  const last = overview?.last_import ?? null;
  const connection = overview?.connection;
  const totals = venues.reduce(
    (t, v) => ({
      activities: t.activities + v.activities_count,
      visible: t.visible + v.visible_count,
      withoutImage: t.withoutImage + v.without_image_count,
    }),
    { activities: 0, visible: 0, withoutImage: 0 },
  );

  const hasImported = !!last?.last_success_at && venues.length > 0;
  const setupDone = !!connection?.has_credentials && hasImported;

  const attention = venues.flatMap((v) => {
    const items: { key: string; venue: AdminVenue; icon: React.ReactNode; text: string }[] = [];
    if (v.activities_count === 0)
      items.push({
        key: `${v.id}-none`,
        venue: v,
        icon: <PackageOpen aria-hidden="true" />,
        text: 'No activities imported, so it has nothing to book in the widget',
      });
    else if (v.visible_count === 0)
      items.push({
        key: `${v.id}-hidden`,
        venue: v,
        icon: <EyeOff aria-hidden="true" />,
        text: `All ${plural(v.activities_count, 'activity is', 'activities are')} hidden from the widget`,
      });
    if (v.without_image_count > 0)
      items.push({
        key: `${v.id}-images`,
        venue: v,
        icon: <ImageOff aria-hidden="true" />,
        text: `${plural(v.without_image_count, 'activity has', 'activities have')} no image`,
      });
    return items;
  });

  return (
    <section className="dmn-admin__section" aria-labelledby="dmn-admin-dashboard-title">
      <div className="dmn-admin__section-header">
        <div>
          <h2 id="dmn-admin-dashboard-title">Dashboard</h2>
          <p className="dmn-admin__help">
            Your latest import from DesignMyNight and anything that needs attention.
          </p>
        </div>
      </div>

      {loading && <Loading>Loading dashboard…</Loading>}
      {!loading && error && <LoadError message={error} onRetry={() => load(loaded)} />}

      {!loading && overview && (
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
                        onClick={() => goToSection('connection')}
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
                    {!hasImported && (
                      <p className="dmn-admin__help">
                        Use <strong>Import from DesignMyNight</strong> at the top of the page.
                      </p>
                    )}
                  </div>
                </li>
                <li className="dmn-admin__step">
                  <Circle aria-hidden="true" />
                  <div>
                    <p className="dmn-admin__step-title">Add the booking widget to a page</p>
                    <button
                      type="button"
                      className="button button--text"
                      onClick={() => goToSection('shortcode')}
                    >
                      See the shortcode
                    </button>
                  </div>
                </li>
              </ol>
            </div>
          )}

          <ImportCard last={last} />

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
            {last && connection && last.environment !== connection.environment && (
              <StatusMessage tone="warning" block>
                The environment has changed since the last import ({envLabel(last.environment)}).
                Import again to load {envLabel(connection.environment)} venues.
              </StatusMessage>
            )}
            <div className="actions dmn-admin__spacer-top">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => goToSection('connection')}
              >
                Manage connection
              </button>
            </div>
          </div>

          {venues.length > 0 && (
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
              <div className="dmn-admin__stat">
                <dt>Without an image</dt>
                <dd>{totals.withoutImage}</dd>
              </div>
            </dl>
          )}

          {venues.length > 0 && (
            <div className="dmn-admin__card dmn-admin__dashboard-wide">
              <div className="dmn-admin__card-header--split dmn-admin__spacer-bottom">
                <h3 className="dmn-admin__flush">Needs attention</h3>
                <button
                  type="button"
                  className="button button--text"
                  onClick={() => goToSection('venues')}
                >
                  View all venues
                </button>
              </div>
              {attention.length === 0 ? (
                <StatusMessage tone="success">
                  Every venue has activities shown in the widget, and every activity has an image.
                </StatusMessage>
              ) : (
                <ul className="dmn-admin__attention">
                  {attention.map((a) => (
                    <li key={a.key}>
                      {a.icon}
                      <span>
                        <a
                          href={venueHref(a.venue.id)}
                          onClick={(e) => {
                            e.preventDefault();
                            openVenue(a.venue.id);
                          }}
                        >
                          {a.venue.title || 'Untitled venue'}
                        </a>
                        : {a.text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** Outcome of the most recent import, and how old the imported data is. */
function ImportCard({ last }: { last: ImportRecord | null }) {
  if (!last) {
    return (
      <div className="dmn-admin__card">
        <h3>Last import</h3>
        <p>
          Nothing has been imported yet. Use <strong>Import from DesignMyNight</strong> at the top
          of the page to bring in your venues and activities.
        </p>
      </div>
    );
  }

  const staleDays =
    last.last_success_at != null
      ? Math.floor((Date.now() / 1000 - last.last_success_at) / 86400)
      : 0;
  const more = last.issues_count - last.issues.length;

  return (
    <div className="dmn-admin__card">
      <h3>Last import</h3>
      {!last.ok ? (
        <StatusMessage tone="error">Failed: {last.error}</StatusMessage>
      ) : last.issues_count > 0 ? (
        <p className="dmn-admin__status">
          <CircleDot className="dmn-admin__chip-icon--warning" aria-hidden="true" />
          <span>Finished with {plural(last.issues_count, 'problem', 'problems')}</span>
        </p>
      ) : (
        <StatusMessage tone="success">Succeeded</StatusMessage>
      )}

      <dl className="dmn-admin__facts">
        <div>
          <dt>{last.ok ? 'Imported' : 'Attempted'}</dt>
          <dd>
            <When at={last.finished_at} />
          </dd>
        </div>
        {!last.ok && (
          <div>
            <dt>Last successful import</dt>
            <dd>{last.last_success_at ? <When at={last.last_success_at} /> : 'None yet'}</dd>
          </div>
        )}
        {last.ok && (
          <>
            <div>
              <dt>Venues</dt>
              <dd>{last.venues_count}</dd>
            </div>
            <div>
              <dt>Activities</dt>
              <dd>{last.types_count}</dd>
            </div>
          </>
        )}
        <div>
          <dt>Environment</dt>
          <dd>{envLabel(last.environment)}</dd>
        </div>
        <div>
          <dt>Took</dt>
          <dd>{formatDuration(last.duration_ms)}</dd>
        </div>
      </dl>

      {last.issues.length > 0 && (
        <details className="dmn-admin__issues">
          <summary>Show {plural(last.issues_count, 'problem', 'problems')}</summary>
          <ul>
            {last.issues.map((issue, i) => (
              <li key={i}>
                <AlertCircle aria-hidden="true" />
                <span>{issue}</span>
              </li>
            ))}
            {more > 0 && <li>…and {more} more.</li>}
          </ul>
        </details>
      )}

      {last.ok && staleDays >= STALE_AFTER_DAYS && (
        <StatusMessage tone="warning" block>
          Imported data is {staleDays} days old. Import again to pick up changes made in
          DesignMyNight.
        </StatusMessage>
      )}
    </div>
  );
}
