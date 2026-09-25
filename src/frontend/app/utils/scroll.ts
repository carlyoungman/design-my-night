import type { StepKey } from '@app/utils/steps';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Radio groups (and native selects on some platforms) change their value as the arrow keys move
// through the options. Moving focus then would pull the user out of the group mid-choice, so we
// remember whether the most recent key press was an arrow key.
const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']);
let lastKey: { key: string; at: number } | null = null;
if (typeof document !== 'undefined') {
  document.addEventListener(
    'keydown',
    (e) => {
      lastKey = { key: e.key, at: Date.now() };
    },
    true,
  );
  document.addEventListener('pointerdown', () => (lastKey = null), true);
}
const isArrowNavigation = () =>
  !!lastKey && ARROW_KEYS.has(lastKey.key) && Date.now() - lastKey.at < 1000;

/**
 * Move to the next step after a choice: focus its heading (so keyboard and screen reader users
 * land on it) and scroll it into view. Skipped while the user is arrowing through options.
 * `from` scopes the lookup to the widget that made the change, as a page can hold several.
 */
export function goToStep(
  step: StepKey,
  opts: { from?: Element | null; delay?: number; offset?: { mobile: number; desktop: number } } = {},
) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (isArrowNavigation()) return;

  const { delay = 400, offset = { mobile: 190, desktop: 200 } } = opts;
  const origin = opts.from ?? document.activeElement;
  const root: ParentNode = origin?.closest('.dmn-widget') ?? document;

  window.setTimeout(() => {
    const heading = root.querySelector<HTMLElement>(`section[data-step="${step}"] h2`);
    if (!heading) return;
    heading.focus({ preventScroll: true });

    const isDesktop = window.matchMedia('(min-width: 774px)').matches;
    const y =
      window.scrollY +
      heading.getBoundingClientRect().top -
      (isDesktop ? offset.desktop : offset.mobile);
    window.scrollTo({ top: Math.max(0, y), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, delay);
}
