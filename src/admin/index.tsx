// src/admin/index.tsx
import React from 'react';
import './styles/styles.scss';
import { createRoot } from 'react-dom/client';
import apiFetch from '@wordpress/api-fetch';
import SettingsCard from '@admin/components/SettingsCard';
import DataSyncCard from '@admin/components/DataSyncCard';
import ActivityManagerCard from '@admin/components/ActivityManagerCard';
import VenuePickerCard from '@admin/components/VenuePickerCard';
import InfoCard from '@admin/components/InfoCard';
import { AdminProvider } from '@admin/AdminContext';
import UrlParamsCard from '@admin/components/UrlParamsCard';

declare global {
  interface Window {
    DMN_ADMIN_BOOT: { restUrl: string; nonce: string };
  }
}

function App() {
  const [dirty, setDirty] = React.useState(false);

  // Warn on page unload if there are unsaved changes
  React.useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  return (
    <AdminProvider>
      <div className="dmn-admin__grid">
        <div className="dmn-admin__main">
          <VenuePickerCard />
          <section className="dmn-admin__card" aria-label="Activities">
            <ActivityManagerCard onDirty={setDirty} />
          </section>
        </div>

        <div className="dmn-admin__side">
          <SettingsCard />
          <DataSyncCard />
          <UrlParamsCard />
          <InfoCard />
        </div>
      </div>
    </AdminProvider>
  );
}

if (window.DMN_ADMIN_BOOT?.nonce) {
  apiFetch.use(apiFetch.createNonceMiddleware(window.DMN_ADMIN_BOOT.nonce));
}

const mount = document.getElementById('dmn-admin-root');
if (mount) createRoot(mount).render(<App />);
