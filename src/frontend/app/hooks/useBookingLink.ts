import { useEffect, useState } from 'react';
import { getLargeGroupLink } from '../../api/public';

type LinkData = { enabled: boolean; minSize: number; label: string; url: string };

export function useBookingLink(venueId?: string | null, skip = false) {
  const [data, setData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip || !venueId) return;
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getLargeGroupLink(venueId);
        if (!alive) return;
        setData(res);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || 'Failed to load booking link');
        setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [venueId, skip]);

  return { data, loading, error };
}
