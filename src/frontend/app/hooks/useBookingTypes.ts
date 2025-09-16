import { useCallback, useEffect, useRef, useState } from 'react';

type Params = {
  venueId: string | null;
  date?: string | null;
  partySize: number | null | undefined;
  enabled?: boolean;
};

type BookingTypeItem = {
  id: string;
  name: string;
  description?: string;
  priceText?: string;
  image_url?: string | null;
  image_id?: number | null;
  valid: boolean | null;
  message?: string | null;
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
      const params = new URLSearchParams({
        venue_id: String(venueId),
        num_people: String(partySize),
      });
      if (date) params.set('date', String(date));

      const res = await fetch(`/wp-json/dmn/v1/booking-types?${params.toString()}`, {
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const data = Array.isArray(json?.data) ? json.data : [];
      const mapped: BookingTypeItem[] = data.map((t: any) => ({
        id: String(t.id),
        name: t.name || String(t.id),
        description: t.description || '',
        priceText: t.priceText || '',
        image_url: t.image_url ?? null,
        image_id: t.image_id ?? null,
        valid: typeof t.valid === 'boolean' ? t.valid : null,
        message: t.message ?? null,
      }));

      // Sort: invalid last, then A–Z
      mapped.sort((a, b) => {
        const aInvalid = a.valid === false;
        const bInvalid = b.valid === false;
        if (aInvalid !== bInvalid) return aInvalid ? 1 : -1;

        const byName = (a.name ?? '').localeCompare(b.name ?? '', undefined, {
          sensitivity: 'base',
        });
        if (byName !== 0) return byName;

        return String(a.id).localeCompare(String(b.id), undefined, { sensitivity: 'base' });
      });

      setTypes(mapped);
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      setError(e?.message || 'Failed to load booking types.');
      setTypes([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, venueId, date, partySize]);

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
