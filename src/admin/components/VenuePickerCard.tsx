import React from 'react';
import { useAdmin } from '../AdminContext';
import { adminListVenues } from '../api';

type AdminVenue = { id: number; title: string; dmn_id?: string };

export default function VenuePickerCard() {
  const { selectedVenueId, setSelectedVenueId } = useAdmin();
  const [venues, setVenues] = React.useState<AdminVenue[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const r = await adminListVenues();
        if (cancel) return;
        const list = (r?.venues ?? []) as AdminVenue[];
        setVenues(list);
        // default to the single venue if only one is available
        if (selectedVenueId == null && list.length === 1) {
          setSelectedVenueId(list[0].id);
        }
      } catch (e: any) {
        if (!cancel) setErr(e?.message || 'Failed to load venues.');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [setSelectedVenueId, selectedVenueId]);

  return (
    <section className="dmn-admin__card">
      <div className="dmn-admin__header">
        <h2 className="dmn-admin__header__headline">Venues</h2>
      </div>

      {err && <p className="err">{err}</p>}
      {loading ? (
        <p>Loading venues…</p>
      ) : (
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span>Select venue</span>
          <select
            value={selectedVenueId ?? ''}
            onChange={(e) => setSelectedVenueId(e.target.value ? Number(e.target.value) : null)}
            style={{ display: 'block', marginTop: 7.5 }}
          >
            <option value="">— Choose a venue —</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} {v.dmn_id ? `(DMN ${v.dmn_id})` : ''}
              </option>
            ))}
          </select>
        </label>
      )}

      <p className="dmn-admin__help">
        This selection applies across Activities and Add-on Packages.
      </p>
    </section>
  );
}
