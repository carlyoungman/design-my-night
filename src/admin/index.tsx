// src/admin/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import SettingsCard from './components/SettingsCard';
import DataSyncCard from './components/DataSyncCard';
import ActivityManagerCard from './components/ActivityManagerCard';

declare global {
  interface Window {
    DMN_ADMIN_BOOT: { restUrl: string; nonce: string };
  }
}

function App() {
  return (
    <div className="dmn-admin">
      <div className="dmn-admin__grid">
        <div className="dmn-admin__main"></div>
        <div className="dmn-admin__side">
          <SettingsCard />
          <DataSyncCard />
          <ActivityManagerCard />
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('dmn-admin-root')!).render(<App />);
