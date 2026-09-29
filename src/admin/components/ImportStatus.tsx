// src/admin/components/ImportStatus.tsx
// Importing from DesignMyNight, and the outcome of the last import, in one place. The import runs
// through one ImportProvider for the whole admin, so its progress and result are the same on the
// Dashboard and in Settings > Connection, and it can't be started twice. ImportStatus shows the
// last import (from the stored overview; showing it makes no DesignMyNight request) with the
// Import button.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { AlertCircle, CircleDot, RefreshCw } from 'lucide-react';
import { type ImportRecord, adminSyncAll } from '@admin/api';
import { useAdmin } from '@admin/AdminContext';
import { useOverview, useVenues } from '@admin/data';
import {
  LoadError,
  Loading,
  ProgressPanel,
  StatusMessage,
  useElapsedSeconds,
} from '@admin/components/ui';
import { useToast } from '@admin/components/Toasts';
import { useConfirm } from '@admin/components/Confirm';

/** Imported data older than this gets a reminder to import again. */
export const STALE_AFTER_DAYS = 7;

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
export const envLabel = (env: 'prod' | 'qa') => (env === 'qa' ? 'QA / Sandbox' : 'Production');
const seconds = (ms: number) => Math.max(1, Math.round(ms / 1000));
const formatDuration = (ms: number) => (ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`);

const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

/** "3 hours ago", "yesterday"… for a Unix timestamp in seconds. */
function ago(at: number, now = Date.now()): string {
  const diff = at - now / 1000;
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

/** Days since the last successful import, or 0 when there is none. */
export const staleDays = (last: ImportRecord | null) =>
  last?.last_success_at != null
    ? Math.floor((Date.now() / 1000 - last.last_success_at) / 86400)
    : 0;

/**
 * The environment the stored venues came from. Older records only have `environment`, which is
 * right only when that import succeeded.
 */
export const dataEnvironment = (last: ImportRecord | null) =>
  last ? (last.data_environment ?? (last.ok ? last.environment : null)) : null;

type ImportCtx = { busy: boolean; elapsed: number; run: () => void };

const ImportContext = createContext<ImportCtx | null>(null);

export function ImportProvider({
  unsavedActivities,
  children,
}: {
  /** Whether Venues has unsaved activity edits, which an import reloads and so discards. */
  unsavedActivities: boolean;
  children: React.ReactNode;
}) {
  const { notifyDataChanged, notifyOverviewChanged, goToSection } = useAdmin();
  const confirm = useConfirm();
  const { refresh: refreshVenues } = useVenues();
  const unsavedRef = useRef(unsavedActivities);
  unsavedRef.current = unsavedActivities;
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const elapsed = useElapsedSeconds(busy);
  const toast = useToast();
  // Try again in the toast runs the import as it is then.
  const runRef = useRef<() => void>(() => {});

  // Leaving the page would lose the outcome of the import, so ask first.
  useEffect(() => {
    if (!busy) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [busy]);

  const run = useCallback(async () => {
    if (busyRef.current) return;
    // Asked here when there are unsaved edits; if the user agrees, they aren't asked again after.
    const agreedToDiscard = unsavedRef.current;
    if (
      agreedToDiscard &&
      !(await confirm({
        title: 'Import and discard unsaved activity changes?',
        message:
          'Importing reloads every venue’s activities, so your unsaved changes to them will be lost. To keep them, save them under Venues first.',
        confirmLabel: 'Import and discard',
        danger: true,
      }))
    )
      return;
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    toast.clear();
    try {
      const r = await adminSyncAll();
      // The import is done; don't show it as running while the question below waits.
      busyRef.current = false;
      setBusy(false);
      // Activities may have been edited while the import ran; reloading them would lose that.
      const reloadEditor =
        agreedToDiscard ||
        !unsavedRef.current ||
        (await confirm({
          title: 'Reload activities and discard unsaved changes?',
          message:
            'The import finished while you had unsaved changes to activities. Reload them now to see what was imported, or keep your changes and save them first.',
          confirmLabel: 'Reload and discard',
          cancelLabel: 'Keep my changes',
          danger: true,
        }));
      toast.success(
        r.message ||
          `Imported ${plural(r.venues_count ?? 0, 'venue', 'venues')} and ${plural(
            r.types_count ?? 0,
            'activity',
            'activities',
          )}.`,
        {
          description:
            [
              r.duration_ms ? `Took ${seconds(r.duration_ms)} s.` : '',
              reloadEditor ? '' : 'Your unsaved activity changes were kept.',
            ]
              .filter(Boolean)
              .join(' ') || undefined,
          action: r.issues_count
            ? { label: 'See problems on the Dashboard', onClick: () => goToSection('dashboard') }
            : { label: 'Review venues', onClick: () => goToSection('venues') },
        },
      );
      if (reloadEditor) {
        notifyDataChanged();
      } else {
        // Update the venue list and the import record, but leave the activity editor as it is.
        refreshVenues();
        notifyOverviewChanged();
      }
    } catch (e) {
      toast.error('Import from DesignMyNight failed.', {
        error: e,
        action: { label: 'Try again', onClick: () => runRef.current() },
      });
      // A failed import changes only its record, not the imported data, so refresh the overview
      // without reloading the activity editor (which would discard its unsaved edits).
      notifyOverviewChanged();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [toast, confirm, refreshVenues, notifyDataChanged, notifyOverviewChanged, goToSection]);
  runRef.current = run;

  return <ImportContext.Provider value={{ busy, elapsed, run }}>{children}</ImportContext.Provider>;
}

export function useImport() {
  const ctx = useContext(ImportContext);
  if (!ctx) throw new Error('useImport must be used within <ImportProvider>');
  return ctx;
}

/**
 * The last import and the Import button. `warnings` shows the stale-data and wrong-environment
 * warnings; the Dashboard lists those under Needs attention instead.
 */
export default function ImportStatus({ warnings = true }: { warnings?: boolean }) {
  const { overview, loading, error, retry } = useOverview();
  const { venues } = useVenues();
  const { busy, elapsed, run } = useImport();
  const blockedId = useId();
  const hasVenues = venues.length > 0;
  const last = overview?.last_import ?? null;
  const connection = overview?.connection;
  // Only while the explanation is on screen; if the overview failed, the server still checks.
  const blocked = !error && connection?.has_credentials === false;

  // How long the last successful import took, to set expectations for this one.
  const typicalMs = last?.ok ? last.duration_ms : null;
  let expectation = 'This can take a minute if you have many venues.';
  if (typicalMs != null) {
    const typical = seconds(typicalMs);
    expectation =
      elapsed <= typical
        ? `The last import took about ${typical} s.`
        : `Taking longer than last time (about ${typical} s). DesignMyNight may be slow to respond.`;
  }

  const stale = last?.ok ? staleDays(last) : 0;
  const dataEnv = dataEnvironment(last);
  const wrongEnv = !!dataEnv && !!connection && hasVenues && dataEnv !== connection.environment;

  return (
    <>
      {loading && !overview ? (
        <Loading>Loading the last import…</Loading>
      ) : error && !overview ? (
        <LoadError message={error} onRetry={retry} />
      ) : (
        <LastImport last={last} hasVenues={hasVenues} />
      )}

      {warnings && last?.ok && stale >= STALE_AFTER_DAYS && (
        <StatusMessage tone="warning" block>
          Imported data is {stale} days old. Import again to pick up changes made in DesignMyNight.
        </StatusMessage>
      )}
      {warnings && wrongEnv && connection && dataEnv && (
        <StatusMessage tone="warning" block>
          Your venues were imported from {envLabel(dataEnv)}, but the environment is now set to{' '}
          {envLabel(connection.environment)}. Import again to load{' '}
          {envLabel(connection.environment)} venues.
        </StatusMessage>
      )}
      {blocked && (
        <div id={blockedId}>
          <StatusMessage tone="warning" block>
            Save your App ID and API key under Connection first.
          </StatusMessage>
        </div>
      )}

      <div className="actions dmn-admin__spacer-top">
        <button
          type="button"
          className="button"
          onClick={() => !blocked && run()}
          // aria-disabled rather than disabled, so the button keeps focus while the import runs.
          aria-disabled={busy || blocked}
          aria-busy={busy}
          aria-describedby={blocked ? blockedId : undefined}
        >
          <RefreshCw aria-hidden="true" className={busy ? 'dmn-admin__spin' : undefined} />
          {busy ? 'Importing…' : 'Import from DesignMyNight'}
        </button>
      </div>

      {busy && (
        <div className="dmn-admin__spacer-top">
          <ProgressPanel
            state="running"
            meta={
              <span aria-hidden="true" className="dmn-admin__progress-timer">
                {elapsed} s
              </span>
            }
          >
            <p className="dmn-admin__progress-title" role="status">
              Importing venues and activities from DesignMyNight…
            </p>
            <p className="dmn-admin__help">
              Fetching your venues, then each venue&rsquo;s activities. {expectation} Keep this page
              open until it finishes.
            </p>
          </ProgressPanel>
        </div>
      )}
    </>
  );
}

/** Outcome of the most recent import, with its problems. */
function LastImport({ last, hasVenues }: { last: ImportRecord | null; hasVenues: boolean }) {
  if (!last) {
    return (
      <p className="dmn-admin__help">
        {hasVenues
          ? 'Your venues were imported before this version of the plugin recorded imports, so there are no details yet. Import again to see them here.'
          : 'Nothing has been imported yet.'}
      </p>
    );
  }

  const more = last.issues_count - last.issues.length;

  return (
    <>
      {!last.ok ? (
        <StatusMessage tone="error">Last import failed: {last.error}</StatusMessage>
      ) : last.issues_count > 0 ? (
        <p className="dmn-admin__status">
          <CircleDot className="dmn-admin__chip-icon--warning" aria-hidden="true" />
          <span>Last import finished with {plural(last.issues_count, 'problem', 'problems')}</span>
        </p>
      ) : (
        <StatusMessage tone="success">Last import succeeded</StatusMessage>
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
            <dd>
              {last.last_success_at ? (
                <When at={last.last_success_at} />
              ) : hasVenues ? (
                'Not recorded (before this version of the plugin)'
              ) : (
                'None yet'
              )}
            </dd>
          </div>
        )}
        {last.ok && (
          <div>
            <dt>Brought in</dt>
            <dd>
              {plural(last.venues_count, 'venue', 'venues')},{' '}
              {plural(last.types_count, 'activity', 'activities')}
            </dd>
          </div>
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
    </>
  );
}
