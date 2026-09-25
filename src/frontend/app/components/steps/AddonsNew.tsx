import React, { useCallback, useEffect } from 'react';
import { useWidgetDispatch, useWidgetState } from '@app/WidgetProvider';
import { useAddons, type AddonItem } from '@app/hooks/useAddons';
import { AddonLine } from '@app/state';
import { StateMessage } from '@app/components/StateMessage';

/**
 * Loads add-ons for the chosen experience. Add-ons are picked on DesignMyNight's checkout,
 * so this only tells the customer they're available.
 */
export default function AddonsNew() {
  const dispatch = useWidgetDispatch();
  const state = useWidgetState();

  const enabled = !!state.venueId && !!state.date && !!state.time && !!state.bookingType;

  const handleLoad = useCallback(
    (list: AddonItem[]) => {
      const lines: AddonLine[] = (list || []).map((p) => {
        const dmnId = String(p.dmn_package_id);
        return {
          id: dmnId,
          dmn_package_id: dmnId,
          name: p.name ?? '',
          priceText: p.priceText ?? '',
          quantity: 1,
        };
      });
      dispatch({ type: 'SET_ADDONS', value: lines });
    },
    [dispatch],
  );

  const {
    addons = [],
    loading,
    error,
  } = useAddons({
    venueId: enabled ? state.venueId! : null,
    activityId: enabled ? state.bookingType! : null,
    enabled,
    onLoad: handleLoad,
  });

  // Reset selections when prerequisites change
  useEffect(() => {
    dispatch({ type: 'SET_ADDONS_SELECTED', value: [] });
  }, [dispatch, state.venueId, state.bookingType, state.date, state.time]);

  if (!enabled || loading || error || addons.length === 0) return null;

  return (
    <div className="addons-note" role="status">
      <StateMessage kind="info">
        Add-ons are available for this experience. You can choose them at checkout.
      </StateMessage>
    </div>
  );
}
