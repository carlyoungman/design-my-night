import React from 'react';
import { useAdmin } from '@admin/AdminContext';
import { adminListVenues } from '@admin/api';
import { LoadError, Loading, errorMessage } from '@admin/components/ui';

type AdminVenue = { id: number; title: string; dmn_id?: string };

export default function VenuePickerCard() {
  const { selectedVenueId, setSelectedVenueId, dataVersion } = useAdmin();
  const [venues, setVenues] = React.useState<AdminVenue[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [attempt, setAttempt] = React.useState(0);

  // Load the list once, and again after an import or a retry.
  React.useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const r = await adminListVenues();
        if (cancel) return;
        setVenues((r?.venues ?? []) as AdminVenue[]);
      } catch (e) {
        if (!cancel) setErr(errorMessage(e, 'Venues could not be loaded.'));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [dataVersion, attempt]);

  // Default to the only venue; drop a remembered venue that no longer exists.
  React.useEffect(() => {
    if (loading || err) return;
    if (selectedVenueId != null && !venues.some((v) => v.id === selectedVenueId)) {
      setSelectedVenueId(venues.length === 1 ? venues[0].id : null);
    } else if (selectedVenueId == null && venues.length === 1) {
      setSelectedVenueId(venues[0].id);
    }
  }, [loading, err, venues, selectedVenueId, setSelectedVenueId]);

  return (
    <section className="dmn-admin__card" aria-labelledby="dmn-admin-venue-title">
      <h2 id="dmn-admin-venue-title">Venue</h2>

      {loading && <Loading>Loading venues…</Loading>}
      {!loading && err && <LoadError message={err} onRetry={() => setAttempt((n) => n + 1)} />}
      {!loading && !err && venues.length === 0 && (
        <p className="dmn-admin__empty">
          No venues yet. Save your API credentials, then use <strong>Import data</strong> to bring
          in your venues from DesignMyNight.
        </p>
      )}
      {!loading && !err && venues.length > 0 && (
        <div className="dmn-admin__field">
          <label htmlFor="dmn-admin-venue-picker">Venue to manage</label>
          <select
            id="dmn-admin-venue-picker"
            value={selectedVenueId ?? ''}
            aria-describedby="dmn-admin-venue-help"
            onChange={(e) => setSelectedVenueId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Choose a venue</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} {v.dmn_id ? `(DMN ${v.dmn_id})` : ''}
              </option>
            ))}
          </select>
          <p id="dmn-admin-venue-help" className="dmn-admin__help">
            The activities below are edited for this venue.
          </p>
        </div>
      )}
    </section>
  );
}
