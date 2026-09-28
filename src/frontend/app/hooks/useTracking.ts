import { useEffect } from 'react';
import { recordVisit, siteDay, track } from '@api/track';
import type { State } from '@app/state';
import { isStepDone, type StepKey } from '@app/utils/steps';

/** Steps counted in the Analytics funnel; group size is filled in by default, so it isn't one. */
const FUNNEL_STEPS: Exclude<StepKey, 'party'>[] = [
  'venue',
  'date',
  'experience',
  'time',
  'details',
];

/**
 * Records the widget opening and each step as it is completed, for the admin's Analytics
 * funnel (see src/frontend/api/track.ts). Each counts once per day for the same venue and
 * experience, so going back and forth doesn't inflate the figures.
 */
export function useTracking(state: State) {
  useEffect(() => recordVisit(), []);

  const venue = state.venueId ?? null;
  const type = state.bookingType ?? null;
  // A step counts only once every step before it is done too. Details, for example, stay
  // valid when the venue changes and the date, experience and time are cleared.
  const firstUndone = FUNNEL_STEPS.findIndex((key) => !isStepDone(key, state));
  const done = firstUndone === -1 ? FUNNEL_STEPS : FUNNEL_STEPS.slice(0, firstUndone);
  const doneKey = done.join(',');

  useEffect(() => {
    for (const step of done) {
      track(
        {
          event: 'step',
          step,
          venue_id: venue,
          type_id: step === 'venue' || step === 'date' ? null : type,
          num_people: state.partySize ?? null,
        },
        // Per day too, like visits, so a visit that runs past midnight counts its steps on both days.
        { once: `step:${step}:${venue ?? ''}:${type ?? ''}:${siteDay()}` },
      );
    }
    // Re-run only when the set of completed steps or the choice they belong to changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneKey, venue, type]);
}
