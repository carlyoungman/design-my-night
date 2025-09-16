import React, { createContext, useContext, useEffect } from 'react';

type Ctx = {
  selectedVenueId: number | null;
  setSelectedVenueId: (id: number | null) => void;
};

const AdminCtx = createContext<Ctx | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [selectedVenueId, setSelectedVenueId] = React.useState<number | null>(() => {
    const raw = localStorage.getItem('dmn.admin.selectedVenueId');
    return raw ? Number(raw) : null;
  });

 useEffect(() => {
    if (selectedVenueId != null)
      localStorage.setItem('dmn.admin.selectedVenueId', String(selectedVenueId));
    else localStorage.removeItem('dmn.admin.selectedVenueId');
  }, [selectedVenueId]);

  return (
    <AdminCtx.Provider value={{ selectedVenueId, setSelectedVenueId }}>
      {children}
    </AdminCtx.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error('useAdmin must be used within <AdminProvider>');
  return ctx;
}
