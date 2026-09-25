import { useCallback, useEffect, useState } from 'react';
import { getVenues } from '@api/public';

type Venue = {
  title: string;
  _id: string;
  name?: string;
  path: string;
  is_external?: boolean;
  external_message?: string;
};

export function useVenues(venueGroup?: string, skip = false) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (skip) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getVenues({ venue_group: venueGroup, fields: 'path,name,title' });
        if (alive) setVenues(res.data.payload?.pages || []);
      } catch {
        if (alive) setError('We couldn’t load venues.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [venueGroup, skip, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { venues, loading, error, reload };
}
