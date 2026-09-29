// Whether the widget records anonymous activity, how long analytics data is kept, and deleting
// the recorded widget activity.
import React, { useEffect, useRef, useState } from 'react';
import {
  type AnalyticsSettings as Settings,
  deleteAnalyticsEvents,
  getAnalyticsSettings,
  saveAnalyticsSettings,
} from '@admin/api';
import { FieldError, LoadError, Loading, SaveState, errorMessage } from '@admin/components/ui';
import { useToast } from '@admin/components/Toasts';
import { DiscardButton, useConfirm } from '@admin/components/Confirm';
import { plural } from './format';

export default function AnalyticsSettings({
  onSaved,
  onDirty,
}: {
  /** Called after a change that affects the reports, so they reload. */
  onSaved: () => void;
  onDirty?: (dirty: boolean) => void;
}) {
  const [saved, setSaved] = useState<Settings | null>(null);
  const [tracking, setTracking] = useState(true);
  const [retention, setRetention] = useState('365');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const saveToast = useToast();
  const deleteToast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    let cancel = false;
    setLoadError(null);
    getAnalyticsSettings()
      .then((s) => {
        if (cancel) return;
        setSaved(s);
        setTracking(s.tracking);
        setRetention(String(s.retention_days));
      })
      .catch(
        (e) => !cancel && setLoadError(errorMessage(e, 'Analytics settings could not be loaded.')),
      );
    return () => {
      cancel = true;
    };
  }, [attempt]);

  const dirty =
    !!saved && (tracking !== saved.tracking || retention.trim() !== String(saved.retention_days));
  useEffect(() => onDirty?.(dirty), [dirty, onDirty]);

  const max = saved?.retention_max ?? 3650;
  const validate = (v: string) => {
    const t = v.trim();
    if (!/^\d+$/.test(t) || Number(t) > max)
      return `Enter a whole number of days from 0 to ${max} (0 keeps data forever).`;
    return null;
  };

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const err = validate(retention);
    setFieldError(err);
    if (err) {
      document.getElementById('dmn-analytics-retention')?.focus();
      return;
    }
    const shorter =
      saved &&
      Number(retention) > 0 &&
      (saved.retention_days === 0 || Number(retention) < saved.retention_days);
    if (
      shorter &&
      !(await confirm({
        title: 'Delete older analytics data?',
        message: `Data older than ${plural(Number(retention), 'day', 'days')} will be deleted now, and can’t be restored.`,
        confirmLabel: 'Save and delete older data',
        danger: true,
      }))
    )
      return;

    setSaving(true);
    saveToast.clear();
    try {
      const s = await saveAnalyticsSettings({ tracking, retention_days: Number(retention) });
      setSaved(s);
      setTracking(s.tracking);
      setRetention(String(s.retention_days));
      saveToast.success('Analytics settings saved.');
      onSaved();
    } catch (err2) {
      saveToast.error('Analytics settings couldn’t be saved', {
        error: err2,
        // The latest save, so a retry sends what the form holds now, not what failed.
        action: { label: 'Try again', onClick: () => saveRef.current() },
      });
    } finally {
      setSaving(false);
    }
  };

  const saveRef = useRef(save);
  saveRef.current = save;

  const deleteEvents = async () => {
    if (
      !(await confirm({
        title: 'Delete all recorded widget activity?',
        message:
          'The funnel and conversion figures start again from zero. Bookings from DesignMyNight are kept.',
        confirmLabel: 'Delete widget activity',
        danger: true,
      }))
    )
      return;
    setDeleting(true);
    deleteToast.clear();
    try {
      const r = await deleteAnalyticsEvents();
      deleteToast.success('Widget activity deleted.', {
        description: `${plural(r.deleted, 'event was', 'events were')} removed.`,
      });
      onSaved();
    } catch (err) {
      deleteToast.error('Widget activity couldn’t be deleted', {
        error: err,
        action: { label: 'Try again', onClick: deleteEvents },
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section
      className="dmn-admin__card dmn-admin__analytics-wide"
      aria-labelledby="dmn-analytics-settings-title"
    >
      <div className="dmn-admin__card-header--split dmn-admin__spacer-bottom">
        <div>
          <h3 id="dmn-analytics-settings-title" className="dmn-admin__flush">
            Analytics settings
          </h3>
          <p className="dmn-admin__help dmn-admin__flush">
            Widget activity is anonymous: each browser tab gets a random ID, with no cookies, IP
            addresses or customer details stored.
          </p>
        </div>
        <SaveState dirty={dirty} />
      </div>

      {loadError ? (
        <LoadError message={loadError} onRetry={() => setAttempt((n) => n + 1)} />
      ) : !saved ? (
        <Loading>Loading analytics settings…</Loading>
      ) : (
        <form className="dmn-admin__form" onSubmit={save} noValidate>
          <div className="dmn-admin__form-grid">
            <div className="dmn-admin__field">
              <label className="dmn-admin__checkbox">
                <input
                  type="checkbox"
                  checked={tracking}
                  onChange={(e) => setTracking(e.target.checked)}
                  aria-describedby="dmn-analytics-tracking-help"
                />
                Record widget activity
              </label>
              <p id="dmn-analytics-tracking-help" className="dmn-admin__help dmn-admin__flush">
                Needed for the funnel and widget conversion. Bookings from DesignMyNight load either
                way.
              </p>
            </div>
            <div className="dmn-admin__field">
              <label htmlFor="dmn-analytics-retention">Keep data for (days)</label>
              <input
                id="dmn-analytics-retention"
                type="number"
                inputMode="numeric"
                min={0}
                max={max}
                step={1}
                value={retention}
                onChange={(e) => {
                  setRetention(e.target.value);
                  if (fieldError) setFieldError(validate(e.target.value));
                }}
                aria-invalid={!!fieldError}
                aria-describedby={`dmn-analytics-retention-help${fieldError ? ' dmn-analytics-retention-error' : ''}`}
              />
              {fieldError && (
                <FieldError id="dmn-analytics-retention-error">{fieldError}</FieldError>
              )}
              <p id="dmn-analytics-retention-help" className="dmn-admin__help dmn-admin__flush">
                Older widget activity, and bookings whose date is older, are deleted daily. 0 keeps
                everything.
              </p>
            </div>
          </div>
          <div className="actions dmn-admin__form-footer">
            <button type="submit" className="button" disabled={saving || !dirty}>
              {saving ? 'Saving…' : 'Save settings'}
            </button>
            <DiscardButton
              dirty={dirty}
              disabled={saving}
              what="the analytics settings"
              onDiscard={() => {
                if (!saved) return;
                setTracking(saved.tracking);
                setRetention(String(saved.retention_days));
                setFieldError(null);
              }}
            />
            <button
              type="button"
              className="button button--danger"
              onClick={deleteEvents}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete widget activity'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
