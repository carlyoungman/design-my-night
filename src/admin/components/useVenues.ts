// src/admin/components/useVenues.ts
import React from 'react';
import { useAdmin } from '@admin/AdminContext';
import { adminListVenues } from '@admin/api';
import { errorMessage } from '@admin/components/ui';

export type AdminVenue = { id: number; title: string; dmn_id?: string };

/**
 * Imported venues, reloaded after an import. Keeps the selected venue valid: defaults to the only
 * venue and drops a remembered venue that no longer exists.
 */
export function useVenues() {
  const { selectedVenueId, setSelectedVenueId, dataVersion } = useAdmin();
  const [venues, setVenues] = React.useState<AdminVenue[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await adminListVenues();
        if (cancel) return;
        setVenues((r?.venues ?? []) as AdminVenue[]);
      } catch (e) {
        if (!cancel) setError(errorMessage(e, 'Venues could not be loaded.'));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [dataVersion, attempt]);

  React.useEffect(() => {
    if (loading || error) return;
    if (selectedVenueId != null && !venues.some((v) => v.id === selectedVenueId)) {
      setSelectedVenueId(venues.length === 1 ? venues[0].id : null);
    } else if (selectedVenueId == null && venues.length === 1) {
      setSelectedVenueId(venues[0].id);
    }
  }, [loading, error, venues, selectedVenueId, setSelectedVenueId]);

  const retry = React.useCallback(() => setAttempt((n) => n + 1), []);

  return { venues, loading, error, retry };
}
