import { useCallback, useEffect, useRef, useState } from 'react';
import { getBookingTypes } from '../../api/public';

// Parameters accepted by useBookingTypes
type Params = {
  /** ID of the selected venue; null when no venue is selected */
  venueId: string | null;
  /** Number of people in the party; null or undefined when not set */
  partySize: number | null | undefined;
  /** booking date (YYYY‑MM‑DD) */
  date?: string | null;
  /** time */
  time?: string | null;
  /** Whether the hook should fetch data; set false to disable */
  enabled?: boolean;
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
}: Params): Return {
  const [types, setTypes] = useState<BookingTypeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const reloadKey = useRef(0);
  const ctrlRef = useRef<AbortController | null>(null);
  const lastKeyRef = useRef<string>('');
  const inFlightRef = useRef<string>('');

  /**
   * Fetch the list of booking types from the backend. Uses the shared API helper
   * to build the REST URL and perform the request.
   */
  const fetchTypes = useCallback(async () => {
    // Do nothing if disabled or required parameters are missing
    if (!enabled || !venueId || partySize == null) {
      setLoading(false);
      return;
    }

    // Abort any ongoing request before starting a new one
    ctrlRef.current?.abort();
    ctrlRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const key = `${venueId}|${date}|${partySize}`;
    if (inFlightRef.current === key) return;
    inFlightRef.current = key;

    try {
      // Call the API helper with appropriate query params
      const res = await getBookingTypes({
        venueId: String(venueId),
        numPeople: partySize,
        // time: time ?? undefined,
        date: date ?? undefined,
      });

      const data = Array.isArray(res?.data) ? res.data : [];
      // Map raw API objects to the strongly‑typed BookingTypeItem structure
      const mapped: BookingTypeItem[] = data.map((t: any) => ({
        id: String(t.id),
        name: t.name || String(t.id),
        description: t.description || '',
        priceText: t.priceText || '',
        duration: t.duration || '',
        image_url: t.image_url ?? null,
        image_id: t.image_id ?? null,
        valid: typeof t.valid === 'boolean' ? t.valid : null,
        message: t.message ?? null,
      }));

      setTypes(mapped);
      lastKeyRef.current = key;
    } catch (e: any) {
      // Ignore aborted requests
      if (e?.name === 'AbortError') return;
      setError(e?.message || 'Failed to load booking types.');
      setTypes([]);
    } finally {
      setLoading(false);
      inFlightRef.current = '';
    }
  }, [enabled, venueId, partySize, date]);

  // Fetch types on mount and whenever dependencies change; ensure we abort
  // outstanding requests during cleanup to avoid setting state on unmounted components
  useEffect(() => {
    fetchTypes();
    return () => ctrlRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTypes, reloadKey.current]);

  /**
   * Force a reload by bumping the internal key; this triggers the useEffect
   * without changing the other dependencies.
   */
  const reload = useCallback(() => {
    reloadKey.current += 1;
    fetchTypes();
  }, [fetchTypes]);

  return { types, loading, error, reload };
}
