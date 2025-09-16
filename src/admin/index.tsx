import React from 'react';
import { createRoot } from 'react-dom/client';
import SettingsCard from './components/SettingsCard';
import DataSyncCard from './components/DataSyncCard';
import ActivityManagerCard from './components/ActivityManagerCard';
import PackagesCard from './components/PackagesCard';
import { AdminProvider } from './AdminContext';
import VenuePickerCard from './components/VenuePickerCard';

declare global {
  interface Window {
    DMN_ADMIN_BOOT: { restUrl: string; nonce: string };
  }
}

function App() {
  return (
    <AdminProvider>
      <div className="dmn-admin">
        <div className="dmn-admin__grid">
          <div className="dmn-admin__main">
            <VenuePickerCard />
            <ActivityManagerCard />
            <PackagesCard />
          </div>
          <div className="dmn-admin__side">
            <SettingsCard />
            <DataSyncCard />
          </div>
        </div>
      </div>
    </AdminProvider>
  );
}

createRoot(document.getElementById('dmn-admin-root')!).render(<App />);
