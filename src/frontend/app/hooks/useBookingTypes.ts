import { useCallback, useEffect, useRef, useState } from 'react';

export type BookingTypeItem = {
  id: string;
  name: string;
  description?: string;
  priceText?: string;
};

type Params = {
  venueId?: string | null;
  date?: string | null;
  partySize?: number | null;
  enabled?: boolean;
};

type Return = {
  types: BookingTypeItem[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function useBookingTypes({ venueId, date, partySize, enabled = true }: Params): Return {
  const [types, setTypes] = useState<BookingTypeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const reloadKey = useRef(0);
  const ctrlRef = useRef<AbortController | null>(null);

  const fetchTypes = useCallback(async () => {
    if (!enabled || !venueId || partySize == null) {
      setTypes([]);
      setError(null);
      return;
    }

    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    setLoading(true);
    setError(null);

    try {
      // 1) Try configured booking types
      const configRes = await fetch(
        `/wp-json/dmn/v1/booking-types?venue_id=${encodeURIComponent(venueId)}`,
        { signal: ctrl.signal },
      );
      const configJson = await configRes.json();
      const configured = Array.isArray(configJson?.data) ? configJson.data : [];

      if (configured.length > 0) {
        const mapped = configured.map((t: any) => ({
          id: String(t.id),
          name: t.name || String(t.id),
          description: t.description || '',
          priceText: t.priceText || '',
        })) as BookingTypeItem[];
        setTypes(mapped);
        return;
      }

      // 2) Fallback to availability suggestions
      const avRes = await fetch(`/wp-json/dmn/v1/booking-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          venue_id: venueId,
          num_people: partySize,
          date,
        }),
      });

      const avJson = await avRes.json();
      const rawSuggested =
        avJson?.validation?.type?.suggestedValues ??
        avJson?.data?.payload?.validation?.type?.suggestedValues ??
        [];

      const suggested = (Array.isArray(rawSuggested) ? rawSuggested : [])
        .map((item: any) => {
          const v = item && typeof item === 'object' && 'value' in item ? item.value : item;
          return v && typeof v === 'object'
            ? { id: String(v.id), name: v.name || String(v.id) }
            : typeof v === 'string'
              ? { id: v, name: v }
              : null;
        })
        .filter(Boolean) as Array<{ id: string; name: string }>;

      // Dedupe and normalize to BookingTypeItem
      const seen = new Set<string>();
      const deduped: BookingTypeItem[] = suggested
        .filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)))
        .map((t) => ({ id: t.id, name: t.name, description: '', priceText: '' }));

      setTypes(deduped);
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      setError(e?.message || 'Failed to load booking types.');
      setTypes([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, venueId, date, partySize]);

  // Auto-run when inputs change or when caller requests reload
  useEffect(() => {
    fetchTypes();
    return () => ctrlRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTypes, reloadKey.current]);

  const reload = useCallback(() => {
    reloadKey.current += 1;
    fetchTypes();
  }, [fetchTypes]);

  return { types, loading, error, reload };
}
