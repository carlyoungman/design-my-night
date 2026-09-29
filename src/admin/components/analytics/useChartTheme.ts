// MUI theme for the charts, built from the palette tokens on `.dmn-admin` (CLAUDE.md section 4)
// so axes, tooltips and series follow the theme colour and light/dark mode. Charts draw SVG and
// render tooltips outside `.dmn-admin`, so they need resolved colours rather than `var(--c-*)`.
// The theme is rebuilt when the mode or theme colour changes (Appearance saves apply live).
import { useEffect, useMemo, useState } from 'react';
import { createTheme } from '@mui/material/styles';

export type ChartColours = {
  primary: string;
  primaryText: string;
  onPrimary: string;
  text: string;
  outline: string;
  divider: string;
  surface: string;
  background: string;
  dark: boolean;
};

const FALLBACK: ChartColours = {
  primary: '#6750a4',
  primaryText: '#6750a4',
  onPrimary: '#ffffff',
  text: '#1d1b20',
  outline: '#79747e',
  divider: '#e7e0ec',
  surface: '#ffffff',
  background: '#f8f7fa',
  dark: false,
};

/** Resolves a token to a colour the browser can use anywhere, e.g. `rgb(103, 80, 164)`. */
function resolve(root: HTMLElement, token: string, fallback: string) {
  const probe = document.createElement('span');
  probe.style.color = `var(${token}, ${fallback})`;
  probe.style.display = 'none';
  root.appendChild(probe);
  const colour = getComputedStyle(probe).color || fallback;
  probe.remove();
  return colour;
}

function read(): ChartColours {
  const root = document.querySelector<HTMLElement>('.dmn-admin');
  if (!root) return FALLBACK;
  return {
    primary: resolve(root, '--c-primary', FALLBACK.primary),
    primaryText: resolve(root, '--c-primary-text', FALLBACK.primaryText),
    onPrimary: resolve(root, '--c-on-primary', FALLBACK.onPrimary),
    text: resolve(root, '--c-text', FALLBACK.text),
    outline: resolve(root, '--c-outline', FALLBACK.outline),
    divider: resolve(root, '--c-divider', FALLBACK.divider),
    surface: resolve(root, '--c-surface', FALLBACK.surface),
    background: resolve(root, '--c-background', FALLBACK.background),
    dark: getComputedStyle(root).colorScheme === 'dark',
  };
}

export function useChartTheme() {
  const [colours, setColours] = useState<ChartColours>(() =>
    typeof document === 'undefined' ? FALLBACK : read(),
  );

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.dmn-admin');
    const update = () =>
      setColours((prev) => {
        const next = read();
        return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
      });
    const observer = new MutationObserver(update);
    if (root) observer.observe(root, { attributes: true, attributeFilter: ['data-mode', 'style'] });
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    media?.addEventListener?.('change', update);
    update();
    return () => {
      observer.disconnect();
      media?.removeEventListener?.('change', update);
    };
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: colours.dark ? 'dark' : 'light',
          primary: { main: colours.primary, contrastText: colours.onPrimary },
          text: { primary: colours.text, secondary: colours.text },
          background: { paper: colours.surface, default: colours.background },
          divider: colours.divider,
        },
        typography: { fontFamily: 'inherit', fontSize: 13 },
        shape: { borderRadius: 8 },
      }),
    [colours],
  );

  // Charts animate their data in; skip it for people who ask for reduced motion.
  const [reducedMotion, setReducedMotion] = useState(
    () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(!!media?.matches);
    media?.addEventListener?.('change', update);
    return () => media?.removeEventListener?.('change', update);
  }, []);

  return { theme, colours, reducedMotion };
}
