import { useEffect, useState } from 'react';
import { getVenues } from '../../api/public';

export function useVenues(venueGroup?: string, skip = false) {
  type Venue = { title: string; _id: string; name?: string; path: string };
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getVenues({ venue_group: venueGroup, fields: 'path,name,title' });
        setVenues(res.data.payload?.pages || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load venues');
      } finally {
        setLoading(false);
      }
    })();
  }, [venueGroup, skip]);

  return { venues, loading, error };
}
