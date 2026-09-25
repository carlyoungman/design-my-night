// src/admin/components/useVenues.ts
import React from 'react';
import { useAdmin } from '@admin/AdminContext';
import { type AdminVenue, adminListVenues } from '@admin/api';
import { errorMessage } from '@admin/components/ui';

export type { AdminVenue };

/**
 * Imported venues with their activity counts, reloaded after an import. `refresh` reloads quietly
 * (keeping the current list on screen), for example to update counts after activities are saved.
 */
export function useVenues() {
  const { dataVersion } = useAdmin();
  const [venues, setVenues] = React.useState<AdminVenue[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  const quiet = React.useRef(false);

  React.useEffect(() => {
    let cancel = false;
    const silent = quiet.current;
    quiet.current = false;
    (async () => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const r = await adminListVenues();
        if (cancel) return;
        setVenues(r?.venues ?? []);
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

  const retry = React.useCallback(() => setAttempt((n) => n + 1), []);
  const refresh = React.useCallback(() => {
    quiet.current = true;
    setAttempt((n) => n + 1);
  }, []);

  return { venues, loading, error, retry, refresh };
}
