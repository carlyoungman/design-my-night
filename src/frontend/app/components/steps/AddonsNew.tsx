import React, { useCallback, useEffect } from 'react';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import LoadingAnimation from '../LoadingAnimation';
import { useAddons } from '../../hooks/useAddons';
import { AddonLine } from '../../state';
import { Notice } from '../Notice';

export default function AddonsNew() {
  const dispatch = useWidgetDispatch();
  const state = useWidgetState();

  const enabled = !!state.venueId && !!state.date && !!state.time && !!state.bookingType;

  const handleLoad = useCallback(
    (list: any[]) => {
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

  return (
    <>
      {!loading && !error && addons.length > 0 && (
        <Notice
          message="Add-ons are available for this experience when you check out!"
          severity="success"
          inlineId="no-addons"
          invalid={true}
        />
      )}
    </>
  );
}
