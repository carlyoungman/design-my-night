// src/admin/components/PageHeader.tsx
// Page identity. Importing from DesignMyNight lives in the Connection section (ImportDataCard).
import React from 'react';

export default function PageHeader() {
  return (
    <header className="dmn-admin__page-header">
      <div className="dmn-admin__page-header-text">
        <h1 className="dmn-admin__title">DesignMyNight bookings</h1>
        <p className="dmn-admin__intro">
          Take bookings on your site with DesignMyNight: connect your account, choose how each
          venue&apos;s activities appear in the booking widget, and add the widget to your pages.
        </p>
      </div>
    </header>
  );
}
