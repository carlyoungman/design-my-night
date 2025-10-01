import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAddons } from '../../api/public';

export type AddonItem = {
  id: string;
  name: string;
  description?: string;
  priceText?: string;
  image_url?: string | null;
  visible?: boolean;
  dmn_package_id?: string | null;
};

type Params = {
  /** DMN external venue id (string, e.g. "552435790df6902b7256f237") */
  venueId?: string | null;
  /** DMN "type" id / activity id (string) */
  activityId?: string | null;
  /** Gate the hook (no requests when false) */
  enabled?: boolean;
  /**
   * Optional: called after successful load.
   * Useful if you want to sync results into global state (e.g. dispatch SET_PACKAGES).
   */
  onLoad?: (addons: AddonItem[]) => void;
};

type Return = {
  addons: AddonItem[];
  loading: boolean;
  error: string | null;
  /** Manually force a refetch (e.g. after toggling something) */
  reload: () => void;
  /** True when we got any items back */
  hasAny: boolean;
};

export function useAddons({ venueId, activityId, enabled = true, onLoad }: Params): Return {
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Used to invalidate in-flight requests on param/reload changes
  const reqIdRef = useRef(0);
  const ctrlRef = useRef<AbortController | null>(null);

  const [reloadTick, setReloadTick] = useState(0);
  const reload = useCallback(() => setReloadTick((n) => n + 1), []);

  // Stable key for memoizing and preventing duplicate fetches
  const key = useMemo(
    () =>
      JSON.stringify({
        venueId: venueId ?? '',
        activityId: activityId ?? '',
        enabled: !!enabled,
        reloadTick,
      }),
    [venueId, activityId, enabled, reloadTick],
  );

  const fetchAddons = useCallback(async () => {
    // Guard clauses
    if (!enabled) {
      setAddons([]);
      setError(null);
      setLoading(false);
      return;
    }
    if (!venueId || !activityId) {
      // We need both a venue and a selected type to fetch add-ons
      setAddons([]);
      setError(null);
      setLoading(false);
      return;
    }

    // Cancel any previous request
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    // Bump request id to avoid race conditions
    const myReqId = ++reqIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const res = await getAddons(String(venueId), String(activityId));
      if (ctrl.signal.aborted) return; // aborted mid-flight
      if (myReqId !== reqIdRef.current) return; // stale response

      const list = Array.isArray(res?.data) ? (res.data as AddonItem[]) : [];

      setAddons(list);
      onLoad?.(list);
      setLoading(false);
      setError(null);
    } catch (e: any) {
      if (ctrl.signal.aborted) return;
      if (myReqId !== reqIdRef.current) return;

      const msg =
        typeof e?.message === 'string' && e.message.trim() ? e.message : 'Failed to load add-ons.';
      setError(msg);
      setAddons([]);
      setLoading(false);
    }
  }, [enabled, venueId, activityId, onLoad]);

  useEffect(() => {
    fetchAddons();
    // Cleanup: abort when unmounting or before next fetch
    return () => {
      ctrlRef.current?.abort();
    };
    // key ensures we refetch on any relevant change (incl. reloadTick)
  }, [key, fetchAddons]);

  return {
    addons,
    loading,
    error,
    reload,
    hasAny: addons.length > 0,
  };
}

export default useAddons;
