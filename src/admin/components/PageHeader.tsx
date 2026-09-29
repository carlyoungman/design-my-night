// src/admin/components/PageHeader.tsx
// Page identity. Importing from DesignMyNight lives in Settings > Connection (ImportDataCard).
import React from 'react';

export default function PageHeader() {
  return (
    <header className="dmn-admin__page-header">
      <div className="dmn-admin__page-header-text">
        <h1 className="dmn-admin__title">DesignMyNight bookings</h1>
        <p className="dmn-admin__intro">
          Take bookings on your site with DesignMyNight: see how bookings are going, choose how each
          venue&apos;s activities appear in the booking widget, and connect and set up the plugin
          under Settings.
        </p>
      </div>
    </header>
  );
}
