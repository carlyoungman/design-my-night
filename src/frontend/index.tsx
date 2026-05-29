import * as React from 'react';
import './styles/index.scss';
import { createRoot } from 'react-dom/client';
import WidgetRoot from '@app/WidgetRoot';
import { ExternalBookingPanel } from '@app/components/ExternalBookingPanel';
import { parseCsvIds } from '@app/utils/helpers';

function boot(el: HTMLElement) {
  // External booking panel mode — renders panel instead of the widget.
  if (el.dataset.displayMode === 'external_booking') {
    let extData: Record<string, string> = {};
    try {
      extData = JSON.parse(el.dataset.extData || '{}');
    } catch {
      // malformed JSON — render nothing
    }
    createRoot(el).render(
      <ExternalBookingPanel
        title={extData.title}
        imageUrl={extData.imageUrl}
        content={extData.content}
        buttonText={extData.buttonText}
        buttonUrl={extData.buttonUrl}
        themeColor={extData.themeColor}
      />,
    );
    return;
  }

  const rawUrlParams = el.dataset.urlParams;
  const allowDisabled = el.dataset.allowDisabled === '1';
  const disableGroupLimit = el.dataset.disableGroupLimit === '1';
  let urlParams: Record<string, string> | undefined;

  if (rawUrlParams) {
    try {
      urlParams = JSON.parse(rawUrlParams);
    } catch {
      const sp = new URLSearchParams(rawUrlParams);
      const obj: Record<string, string> = {};
      sp.forEach((value, key) => {
        obj[key] = value;
      });
      urlParams = obj;
    }
  }

  const defaultTypeIds = parseCsvIds(el.dataset.typeId);

  const props = {
    venueGroup: el.dataset.venueGroup || undefined,
    defaultVenueId: el.dataset.venueId || undefined,
    defaultTypeIds,
    defaultTypeId: defaultTypeIds?.length === 1 ? defaultTypeIds[0] : undefined,
    allowedDays: el.dataset.allowedDays || undefined,
    allowDisabled,
    disableGroupLimit,
    urlParams,
  };

  createRoot(el).render(<WidgetRoot {...(props as any)} />);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll<HTMLElement>('.dmn-widget-root').forEach(boot);
});
