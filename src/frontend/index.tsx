import * as React from 'react';
import './styles/index.scss';
import { createRoot } from 'react-dom/client';
import WidgetRoot from './app/WidgetRoot';

function boot(el: HTMLElement) {
  const props = {
    venueGroup: el.dataset.venueGroup || undefined,
    forcedVenueId: el.dataset.venueId || undefined,
    corpThreshold: Number(el.dataset.corpThreshold || 20),
    corpEnquiryUrl: el.dataset.corpEnquiryUrl || undefined,
    returnUrl: el.dataset.returnUrl || undefined,
  };
  createRoot(el).render(<WidgetRoot {...(props as any)} />);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll<HTMLElement>('.dmn-widget-root').forEach(boot);
});
