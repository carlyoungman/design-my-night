import { useCallback, useEffect, useRef, useState } from 'react';
import { getBookingTypes } from '../../api/public';

// Parameters accepted by useBookingTypes
type Params = {
  /** ID of the selected venue; null when no venue is selected */
  venueId: string | null;
  /** Number of people in the party; null or undefined when not set */
  partySize: number | null | undefined;
  /** booking date (YYYY-MM-DD) */
  date?: string | null;
  /** time */
  time?: string | null;
  /** Whether the hook should fetch data; set false to disable */
  enabled?: boolean;

  /** When true, include dashboard-disabled WP activities */
  allowDisabled?: boolean;
};

// Structure of a single booking type as returned by the backend
type BookingTypeItem = {
  id: string;
  name: string;
  description?: string;
  priceText?: string | null;
  duration?: number | null;
  image_url?: string | null;
  image_id?: number | null;
  valid: boolean | null;
  message?: string | null;
  type_text?: string | null;
  price_mode?: 'per_person' | 'per_room' | null;
  visible?: boolean | null;
};

// Structure returned by this hook
type Return = {
  types: BookingTypeItem[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function useBookingTypes({
  venueId,
  date,
  partySize,
  time,
  enabled = true,
  allowDisabled = false,
}: Params): Return {
  const [types, setTypes] = useState<BookingTypeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reloadKey = useRef(0);
  const ctrlRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef<string>('');

  const fetchTypes = useCallback(async () => {
    if (!enabled || !venueId || partySize == null) {
      setLoading(false);
      return;
    }

    ctrlRef.current?.abort();
    ctrlRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const key = `${venueId}|${date}|${partySize}|${time}|${allowDisabled ? 1 : 0}`;
    if (inFlightRef.current === key) return;
    inFlightRef.current = key;

    try {
      const res = await getBookingTypes({
        venueId: String(venueId),
        numPeople: partySize,
        date: date ?? undefined,
        time: time ?? undefined,
        allowDisabled,
      });

      const data = Array.isArray(res?.data) ? res.data : [];

      const mapped: BookingTypeItem[] = data.map((t: any) => ({
        id: String(t.id),
        name: t.name || String(t.id),
        description: t.description || '',
        priceText: t.priceText || '',
        duration: t.duration ?? null,
        image_url: t.image_url ?? null,
        image_id: t.image_id ?? null,
        valid: typeof t.valid === 'boolean' ? t.valid : null,
        message: t.message ?? null,
        type_text: t.type_text ?? null,
        price_mode: t.price_mode ?? 'per_person',
        visible: typeof t.visible === 'boolean' ? t.visible : null,
      }));

      setTypes(mapped);
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      setError(e?.message || 'Failed to load booking types.');
      setTypes([]);
    } finally {
      setLoading(false);
      inFlightRef.current = '';
    }
  }, [enabled, venueId, partySize, date, time, allowDisabled]);

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
