// src/admin/unload.ts
// The admin warns before the page unloads while a section has unsaved edits (index.tsx). A reload
// the app starts itself after the edits stop mattering, such as after Start over reset every
// setting, must not be stopped by that warning: the server has already changed.

let warn = true;

/** Whether the unsaved-changes warning should run when the page unloads. */
export const shouldWarnOnUnload = () => warn;

/** Reloads the page without the unsaved-changes warning. */
export function reloadWithoutWarning() {
  warn = false;
  window.location.reload();
}
