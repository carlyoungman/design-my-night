// How far visitors got through the booking widget, from opening it to DesignMyNight's checkout.
import React from 'react';
import type { AnalyticsReport, FunnelStageKey } from '@admin/api';
import { EmptyChart } from './parts';
import { fmtInt, fmtPct, plural } from './format';

const LABELS: Record<FunnelStageKey, string> = {
  view: 'Opened the widget',
  venue: 'Venue chosen',
  date: 'Date chosen',
  experience: 'Experience chosen',
  time: 'Time chosen',
  details: 'Details entered',
  handoff: 'Went to checkout',
};

export default function FunnelCard({
  funnel,
  tracking,
  filtered,
  onClearFilters,
}: {
  funnel: AnalyticsReport['funnel'];
  tracking: boolean;
  filtered: boolean;
  onClearFilters: () => void;
}) {
  const stages = funnel.stages;
  // Percentages are of the first stage that can be counted under the current filters.
  const base = stages.find((s) => s.count != null)?.count ?? 0;

  if (base === 0 && stages.every((s) => !s.count)) {
    return (
      <EmptyChart filtered={filtered} onClearFilters={onClearFilters}>
        {tracking
          ? 'No widget activity in this period.'
          : 'No widget activity in this period. Recording widget activity is turned off in the Settings tab.'}
      </EmptyChart>
    );
  }

  return (
    <>
      <ol className="dmn-admin__funnel">
        {stages.map((s, i) => {
          const prev =
            stages
              .slice(0, i)
              .reverse()
              .find((p) => p.count != null)?.count ?? null;
          const share = s.count != null && base > 0 ? s.count / base : null;
          const drop = s.count != null && prev ? 1 - s.count / prev : null;
          return (
            <li key={s.key} className="dmn-admin__funnel-stage">
              <span className="dmn-admin__funnel-label">{LABELS[s.key]}</span>
              {s.count == null ? (
                <span className="dmn-admin__funnel-na">Not available with these filters</span>
              ) : (
                <>
                  <span className="dmn-admin__bar dmn-admin__funnel-bar" aria-hidden="true">
                    <span style={{ width: `${Math.min(1, share ?? 0) * 100}%` }} />
                  </span>
                  <span className="dmn-admin__funnel-figures">
                    <strong>{fmtInt(s.count)}</strong>
                    {share != null && i > 0 && <> · {fmtPct(share)} of start</>}
                    {drop != null && drop > 0 && i > 0 && (
                      <span className="dmn-admin__funnel-drop"> · {fmtPct(drop)} dropped off</span>
                    )}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
      <p className="dmn-admin__help dmn-admin__spacer-top">
        Counts visitors (browser tabs), each once per stage. A step the widget fills in itself, such
        as a venue set in the shortcode or a venue’s only experience, counts as reached. Group size
        isn’t shown because it is filled in as soon as a venue is chosen.
        {funnel.checkout_errors > 0 &&
          ` ${plural(funnel.checkout_errors, 'visitor', 'visitors')} couldn’t continue to checkout, for example because their time was no longer available.`}
      </p>
    </>
  );
}
