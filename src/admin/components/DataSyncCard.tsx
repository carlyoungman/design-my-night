// src/admin/components/DataSyncCard.tsx
import React, { useState } from 'react';
import { adminSyncAll } from '../api';

export default function DataSyncCard() {
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
    } catch (e: any) {
      setErr(e.message || 'Sync failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="dmn-admin__card">
      <h2>Data Sync</h2>
      <p>Import data from DesignMyNight.</p>
      <div className="actions">
        <button className="button button--action" onClick={run} disabled={busy}>
          {busy ? 'Importing…' : 'Import data'}
        </button>
      </div>
      {ok && (
        <p className="ok" style={{ marginTop: 8 }}>
          {ok}
        </p>
      )}
      {err && (
        <p className="err" style={{ marginTop: 8 }}>
          {err}
        </p>
      )}
    </section>
  );
}
