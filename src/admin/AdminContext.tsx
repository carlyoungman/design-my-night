import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';

type Ctx = {
  selectedVenueId: number | null;
  setSelectedVenueId: (id: number | null) => void;
  /** Increments after a data import so screens can reload imported data. */
  dataVersion: number;
  notifyDataChanged: () => void;
};

const AdminCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = 'dmn.admin.selectedVenueId';

function readStoredVenue(): number | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [selectedVenueId, setSelectedVenueId] = React.useState<number | null>(readStoredVenue);
  const [dataVersion, setDataVersion] = React.useState(0);

  useEffect(() => {
    try {
      if (selectedVenueId != null)
        window.localStorage.setItem(STORAGE_KEY, String(selectedVenueId));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable (private mode or blocked); the selection just won't persist.
    }
  }, [selectedVenueId]);

  const notifyDataChanged = useCallback(() => setDataVersion((v) => v + 1), []);

  const value = useMemo(
    () => ({ selectedVenueId, setSelectedVenueId, dataVersion, notifyDataChanged }),
    [selectedVenueId, dataVersion, notifyDataChanged],
  );

  return <AdminCtx.Provider value={value}>{children}</AdminCtx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error('useAdmin must be used within <AdminProvider>');
  return ctx;
}
