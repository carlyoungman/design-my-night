import React, { useEffect, useState } from 'react';
import { StepShell } from '../StepShell';
import { useWidgetState, useWidgetDispatch } from '../../WidgetProvider';
import { getPackages } from '../../../api/public';
import LoadingAnimation from '../LoadingAnimation';
import { AddOnPackage } from '../../types';

export function PackagesStep() {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();
  const [packages, setPackages] = useState<AddOnPackage[]>([]);
  const [loading, setLoading] = useState(false);
  // Load packages whenever the selected venue (DMN ID) changes
  useEffect(() => {
    // If no venue is selected, clear packages and bail out
    if (!state.venueId) {
      setPackages([]);
      return;
    }

    async function fetchPackages() {
      setLoading(true);
      try {
        const res = await getPackages(String(state.venueId));
        const raw = res.data || [];
        const mapped: AddOnPackage[] = raw.map((pkg: any) => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description ?? '',
          priceText: pkg.priceText ?? '',
          image_url: pkg.image_url ?? null,
          visible: pkg.visible ?? true,
          dmn_package_id: pkg.dmn_package_id ?? null,
        }));
        setPackages(mapped);
        dispatch({ type: 'SET_PACKAGES', value: mapped });
      } catch (e: any) {
        setPackages([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPackages();
  }, [state.venueId, dispatch]);

  const toggle = (id: string, checked: boolean) => {
    const next = new Set(state.packagesSelected);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    dispatch({ type: 'SET_PACKAGES_SELECTED', value: Array.from(next) });
  };

  return (
    <StepShell className="packages">
      {loading && <LoadingAnimation text="Loading Add-ons…"></LoadingAnimation>}
      {!loading && packages.length === 0 && (
        <LoadingAnimation text="Venue required"></LoadingAnimation>
      )}

      {!loading && packages.length > 0 && (
        <div className="package-grid">
          {packages.map((pkg) => {
            const isSelected = state.packagesSelected.includes(pkg.id);
            return (
              <label key={pkg.id} className={`package-card${isSelected ? ' is-selected' : ''}`}>
                {pkg.image_url && (
                  <div className="package-card__image-wrapper">
                    <img src={pkg.image_url} alt={pkg.name} className="package-card__image" />
                  </div>
                )}
                <article className="package-card__article">
                  <h6 className="package-card__name">{pkg.name}</h6>
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
                  onChange={(e) => toggle(pkg.id, e.target.checked)}
                />
              </label>
            );
          })}
        </div>
      )}
    </StepShell>
  );
}
