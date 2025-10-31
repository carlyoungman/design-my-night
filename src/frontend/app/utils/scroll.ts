type Offset = number | { mobile?: number; desktop?: number };

export function scrollToSection(
  target: string,
  opts?: { offset?: Offset; delay?: number; breakpointPx?: number },
) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  const {
    offset = 0,
    delay = 0,
    breakpointPx = 774, // desktop at ≥774px
  } = opts || {};

  // If it looks like a selector, use it directly; otherwise assume data-step
  const isSelector = /[#.\[\s>:+~]|^section\b/.test(target);
  const selector = isSelector ? target : `section[data-step="${target}"]`;

  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return false;

  const isDesktop = window.matchMedia(`(min-width: ${breakpointPx}px)`).matches;
  const effectiveOffset =
    typeof offset === 'number' ? offset : isDesktop ? (offset.desktop ?? 0) : (offset.mobile ?? 0);

  const doScroll = () => {
    const y = window.scrollY + el.getBoundingClientRect().top - effectiveOffset;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  };

  if (delay > 0) setTimeout(() => requestAnimationFrame(doScroll), delay);
  else requestAnimationFrame(doScroll);

  return true;
}
