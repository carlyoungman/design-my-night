// src/admin/components/RemoveDataCard.tsx
// Removes the imported venues and activities (and optionally every setting), so the plugin is back
// to how it looks before any import. Asks for confirmation in a modal dialog first.
import React, { useEffect, useId, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { adminRemoveData } from '@admin/api';
import { useAdmin } from '@admin/AdminContext';
import { useToast } from '@admin/components/Toasts';
import { reloadWithoutWarning } from '@admin/unload';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default function RemoveDataCard() {
  const { section, settingsTab, openSettingsTab, notifyDataChanged } = useAdmin();
  // Set by Try again: the dialog opens once Settings > Connection is showing (see below).
  const [retryPending, setRetryPending] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [includeSettings, setIncludeSettings] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const headingId = useId();
  const titleId = useId();
  const descId = useId();

  /** Opens the dialog; a fresh start unticks "Also reset all settings", a retry keeps the choice. */
  const open = (reset = true) => {
    if (reset) setIncludeSettings(false);
    dialogRef.current?.showModal();
    // Start on the safe choice rather than the first control.
    cancelRef.current?.focus();
  };

  // A modal inside a hidden section would open invisibly and block the page, so Try again (whose
  // toast can be clicked from any section) switches to Settings > Connection first and opens it
  // from here, after the tab is shown.
  useEffect(() => {
    if (!retryPending || section !== 'settings' || settingsTab !== 'connection') return;
    setRetryPending(false);
    open(false);
  }, [retryPending, section, settingsTab]);

  const retry = () => {
    setRetryPending(true);
    openSettingsTab('connection');
  };

  const close = () => {
    if (!busy) dialogRef.current?.close();
  };

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    toast.clear();
    try {
      const r = await adminRemoveData(includeSettings);
      if (r.settings_removed) {
        // Every section and the page's colours come from the settings, so start again from them.
        // The settings are already gone, so unsaved edits elsewhere no longer matter: reload
        // without the unsaved-changes warning, which would leave the page showing them.
        window.location.hash = 'dashboard';
        reloadWithoutWarning();
        return;
      }
      dialogRef.current?.close();
      toast.success('Imported data removed.', {
        description: `Removed ${plural(r.venues_removed, 'venue', 'venues')} and ${plural(
          r.activities_removed,
          'activity',
          'activities',
        )}.`,
      });
      notifyDataChanged();
    } catch (e) {
      dialogRef.current?.close();
      toast.error('Data could not be removed.', {
        error: e,
        action: { label: 'Try again', onClick: retry },
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="dmn-admin__card dmn-admin__spacer-top" aria-labelledby={headingId}>
      <h3 id={headingId}>Start over</h3>
      <p>
        Delete the imported venues and activities, with your edits to them, the import history, and
        the analytics data, so you can see the plugin as it is before an import. Run step 2 again to
        bring them back. Images stay in the media library.
      </p>
      <div className="actions">
        <button type="button" className="button button--danger" onClick={() => open()}>
          <Trash2 aria-hidden="true" />
          Remove all data…
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="dmn-admin__dialog"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onCancel={(e) => {
          if (busy) e.preventDefault();
        }}
      >
        <h3 id={titleId}>Remove all data?</h3>
        <p id={descId}>
          Every imported venue and activity, including names, descriptions, prices, images and
          visibility you set for them, the import history, and the analytics data (bookings loaded
          from DesignMyNight and recorded widget activity) will be deleted. This can&rsquo;t be
          undone.
        </p>
        <label className="dmn-admin__checkbox">
          <input
            type="checkbox"
            checked={includeSettings}
            disabled={busy}
            onChange={(e) => setIncludeSettings(e.target.checked)}
          />
          Also reset all settings
        </label>
        <p className="dmn-admin__help">
          Removes the API credentials, environment and venue group, URL parameters, appearance, and
          analytics settings, as on a new install. The page reloads afterwards.
        </p>
        <div className="actions dmn-admin__dialog-actions">
          <button
            ref={cancelRef}
            type="button"
            className="button button--secondary"
            onClick={close}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button button--danger"
            onClick={remove}
            aria-disabled={busy}
            aria-busy={busy}
          >
            <Trash2 aria-hidden="true" />
            {busy ? 'Removing…' : includeSettings ? 'Remove data and settings' : 'Remove data'}
          </button>
        </div>
      </dialog>
    </section>
  );
}
