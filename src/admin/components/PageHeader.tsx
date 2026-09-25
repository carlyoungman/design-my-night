// src/admin/components/PageHeader.tsx
// Page identity. Importing from DesignMyNight lives in the Connection section (ImportDataCard).
import React from 'react';

export default function PageHeader() {
  return (
    <header className="dmn-admin__page-header">
      <div className="dmn-admin__page-header-text">
        <h1 className="dmn-admin__title">DesignMyNight bookings</h1>
        <p className="dmn-admin__intro">
          Your DesignMyNight venues and how their activities appear in the booking widget. Import
          them under Connection, and again after you add or change venues or activities in
          DesignMyNight.
        </p>
      </div>
    </header>
  );
}
