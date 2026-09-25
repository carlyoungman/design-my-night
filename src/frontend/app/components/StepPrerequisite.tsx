import React from 'react';
import { useWidgetState } from '@app/WidgetProvider';
import { StateMessage } from '@app/components/StateMessage';
import type { State } from '@app/state';

export type PrerequisiteKey = 'venue' | 'partySize' | 'date' | 'experience' | 'time';

const CHECKS: Record<PrerequisiteKey, (s: State) => boolean> = {
  venue: (s) => !!s.venueId,
  partySize: (s) => s.partySize != null,
  date: (s) => !!s.date,
  experience: (s) => !!s.bookingType,
  time: (s) => !!s.time,
};

const LABELS: Record<PrerequisiteKey, string> = {
  venue: 'venue',
  partySize: 'group size',
  date: 'date',
  experience: 'experience',
  time: 'time',
};

function buildText(missing: string[]): string {
  if (missing.length === 1) return `Choose a ${missing[0]} first.`;
  const head = missing.slice(0, -1).join(', ');
  return `Choose a ${head} and ${missing[missing.length - 1]} first.`;
}

/** Explains which earlier steps are needed. Renders nothing once they're complete. */
export function StepPrerequisite({ requires }: { requires: PrerequisiteKey[] }) {
  const state = useWidgetState();
  const missing = requires.filter((k) => !CHECKS[k](state)).map((k) => LABELS[k]);
  if (missing.length === 0) return null;
  return <StateMessage kind="prerequisite">{buildText(missing)}</StateMessage>;
}
