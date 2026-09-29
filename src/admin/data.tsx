// src/admin/data.tsx
// Data several sections show, loaded once and shared: the imported venues (Venues, Dashboard,
// the shortcode generator) and the overview (Dashboard, the import step, the shortcode
// generator's venue group). Each is fetched once when the admin opens, not once per section.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAdmin } from '@admin/AdminContext';
import { type AdminVenue, adminListVenues, adminOverview } from '@admin/api';
import { errorMessage } from '@admin/components/ui';

export type { AdminVenue };
export type Overview = Awaited<ReturnType<typeof adminOverview>>;

type Resource<T> = {
  data: T | null;
  /** True while there is nothing to show yet: the first load, or a reload after an import. */
  loading: boolean;
  /** Whether a load has succeeded, so `data` is real rather than empty. */
  loaded: boolean;
  error: string | null;
  /** Loads again, showing the loading state. For Try again after an error. */
  retry: () => void;
  /** Loads again, keeping the current data on screen, for example after a save changed it. */
  refresh: () => void;
};

/**
 * One shared resource. Reloads when `version` changes; `quietOnVersion` keeps the current data on
 * screen during those reloads. Only the newest request may update it, so a slow response can't
 * overwrite newer data.
 */
function useResource<T>(
  load: () => Promise<T>,
  failure: string,
  version: number,
  quietOnVersion: boolean,
): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const quiet = useRef(false);
  const loud = useRef(false);
  const latest = useRef(0);
  const hasData = data != null;

  useEffect(() => {
    const request = ++latest.current;
    const silent = !loud.current && (quiet.current || (quietOnVersion && hasData));
    quiet.current = false;
    loud.current = false;
    if (!silent) setLoading(true);
    setError(null);
    load()
      .then((d) => request === latest.current && setData(d))
      .catch((e) => request === latest.current && setError(errorMessage(e, failure)))
      .finally(() => request === latest.current && setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `hasData` only picks quiet vs full.
  }, [load, failure, version, attempt, quietOnVersion]);

  const retry = useCallback(() => {
    loud.current = true;
    setAttempt((n) => n + 1);
  }, []);
  const refresh = useCallback(() => {
    quiet.current = true;
    setAttempt((n) => n + 1);
  }, []);

  return useMemo(
    () => ({ data, loading, loaded: hasData, error, retry, refresh }),
    [data, loading, hasData, error, retry, refresh],
  );
}

type Ctx = { venues: Resource<AdminVenue[]>; overview: Resource<Overview> };

const DataCtx = createContext<Ctx | null>(null);

const loadVenues = () => adminListVenues().then((r) => r?.venues ?? []);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { dataVersion, overviewVersion } = useAdmin();
  // An import replaces the venues, so they reload with the loading state. The overview changes in
  // smaller ways (settings saved, an import recorded) and reloads quietly.
  const venues = useResource(loadVenues, 'Venues could not be loaded.', dataVersion, false);
  const overview = useResource(
    adminOverview,
    'The last import and connection status could not be loaded.',
    dataVersion + overviewVersion,
    true,
  );
  const value = useMemo(() => ({ venues, overview }), [venues, overview]);
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

function useData() {
  const ctx = useContext(DataCtx);
  if (!ctx) throw new Error('useData must be used within <DataProvider>');
  return ctx;
}

/** Imported venues with their activity counts. */
export function useVenues() {
  const { data, ...rest } = useData().venues;
  return { venues: data ?? [], ...rest };
}

/** The last import and the connection settings. `overview` is null until it first loads. */
export function useOverview() {
  const { data, ...rest } = useData().overview;
  return { overview: data, ...rest };
}
