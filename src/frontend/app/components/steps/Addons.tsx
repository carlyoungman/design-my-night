import React, { useCallback, useEffect } from 'react';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import LoadingAnimation from '../LoadingAnimation';
import { useAddons } from '../../hooks/useAddons';
import { AddonLine } from '../../state';
import { Notice } from '../Notice';

export default function Addons() {
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

  const toggle = (dmn_package_id: string, checked: boolean) => {
    const next = new Set(state.addonsSelected || []);
    checked ? next.add(dmn_package_id) : next.delete(dmn_package_id);
    dispatch({ type: 'SET_ADDONS_SELECTED', value: Array.from(next) });
  };

  // Prerequisites not met: show hint and stop (matches other steps)
  if (!enabled) {
    return (
      <section className="addons">
        <LoadingAnimation type="required" text="Venue, date, time and experience required" />
      </section>
    );
  }

  return (
    <section className="addons">
      {loading && <LoadingAnimation type="loading" text="Loading add-ons…" />}

      {!loading && error && (
        <>
          <p className="dmn-widget__error">
            We couldn’t load add-ons. You can continue without selecting any.
          </p>
          <Notice
            message="We couldn’t load add-ons. You can continue without selecting any."
            severity="success"
            inlineId="addons-load-error"
            invalid={true}
          />
        </>
      )}

      {!loading && !error && addons.length === 0 && (
        <>
          <p className="dmn-widget__error">
            No add-ons are available for this experience.<br></br> <span>You can continue.</span>
          </p>
          <Notice
            message="No add-ons are available for this experience. You can continue."
            severity="success"
            inlineId="no-addons"
            invalid={true}
          />
        </>
      )}

      {!loading && !error && addons.length > 0 && (
        <div className="package-grid">
          <Notice
            message="Add-ons found for this experience!."
            severity="success"
            inlineId="addons-available"
            invalid={true}
          />
          {addons.map((pkg) => {
            const id = String(pkg.dmn_package_id);
            const isSelected = (state.addonsSelected || []).includes(id);
            return (
              <label key={id} className={`package-card${isSelected ? ' is-selected' : ''}`}>
                {pkg.image_url && (
                  <div className="package-card__image-wrapper">
                    <img src={pkg.image_url} alt={pkg.name} className="package-card__image" />
                  </div>
                )}
                <article className="package-card__article">
                  {pkg.name && <h6 className="package-card__name">{pkg.name}</h6>}
                  {pkg.description && (
                    <p
                      className="package-card__description"
                      dangerouslySetInnerHTML={{ __html: pkg.description }}
                    />
                  )}
                  <div className="package-card__article-footer">
                    {pkg.priceText && <p className="package-card__price">{pkg.priceText}</p>}
                    <span className="package-card__button">{isSelected ? 'Remove' : 'Add'}</span>
                  </div>
                </article>
                <input
                  type="checkbox"
                  className="package-card__checkbox"
                  checked={isSelected}
                  onChange={(e) => toggle(id, e.target.checked)}
                />
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}
