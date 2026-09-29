// src/admin/components/ImportDataCard.tsx
// Step 2 of the Connection tab under Settings: import venues and activities from DesignMyNight with
// the credentials saved in step 1 (SettingsCard). The status and the button are ImportStatus, shared
// with the Dashboard.
import React from 'react';
import ImportStatus from '@admin/components/ImportStatus';

export default function ImportDataCard() {
  return (
    <section
      className="dmn-admin__card dmn-admin__spacer-top"
      aria-labelledby="dmn-admin-import-title"
    >
      <div className="dmn-admin__card-header">
        <h3 id="dmn-admin-import-title">2. Import venues and activities</h3>
        <p className="dmn-admin__help">
          Brings in your venues and their activities using the credentials saved in step 1. Import
          again after you add or change venues or activities in DesignMyNight; your edits in the
          plugin are kept.
        </p>
      </div>
      <ImportStatus />
    </section>
  );
}
