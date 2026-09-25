// src/admin/components/DataSyncCard.tsx
import React, { useState } from 'react';
import { adminSyncAll } from '@admin/api';
import { useAdmin } from '@admin/AdminContext';
import { StatusMessage, errorMessage } from '@admin/components/ui';

export default function DataSyncCard() {
  const { notifyDataChanged } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setOk(null);
    setErr(null);
    try {
      const r = await adminSyncAll();

      if (r.message) {
        setOk(r.message);
      } else {
        const venues = r.venues_count ?? 0;
        const types = r.types_count ?? 0;
        const menus = r.menus_count ?? 0;
        const items = r.menu_items_count ?? 0;

        const parts = [
          `${venues} venues`,
          `${types} activity types`,
          `${menus} menus`,
          `${items} menu items`,
        ];

        setOk(`Imported ${parts.join(', ')}.`);
      }
      notifyDataChanged();
    } catch (e) {
      setErr(
        errorMessage(e, 'Import failed. Check your API credentials with Test connection, then try again.'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="dmn-admin__card" aria-labelledby="dmn-admin-sync-title">
      <h2 id="dmn-admin-sync-title">Data sync</h2>
      <p>
        Import venues and activities from DesignMyNight. Run this again after you add or change
        venues or activities in DesignMyNight.
      </p>
      <div className="actions">
        <button type="button" className="button" onClick={run} disabled={busy} aria-busy={busy}>
          {busy ? 'Importing…' : 'Import data'}
        </button>
      </div>
      {ok && (
        <StatusMessage tone="success" block>
          {ok}
        </StatusMessage>
      )}
      {err && (
        <StatusMessage tone="error" block>
          {err}
        </StatusMessage>
      )}
    </section>
  );
}
