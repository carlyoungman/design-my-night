// src/admin/themeVars.ts
// The theme colour's `--theme-*` custom properties, worked out in the browser for the Appearance
// preview, so an unsaved colour can be seen before it is saved. This is a copy of
// Appearance::css_vars() in src/php/Config/Appearance.php; keep the two in step (the server's
// values are the ones used once saved).

type Rgb = [number, number, number];

/** Surface and background colours of each mode. Keep in step with `_palette.scss`. */
const SURFACES: Record<'light' | 'dark', string[]> = {
  light: ['#ffffff', '#f8f7fa'],
  dark: ['#211f26', '#141218'],
};
const TEXT_LIGHT = '#1d1b20';

const rgb = (hex: string): Rgb => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
};
const hex = (c: Rgb) => `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;

const luminance = (c: Rgb) => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: Rgb, b: Rgb) => {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

const minContrast = (c: Rgb, against: Rgb[]) => Math.min(...against.map((bg) => contrast(c, bg)));

/** Text colour for a fill: whichever of white and the light-mode text colour contrasts more. */
const onColour = (fill: string) =>
  contrast(rgb(fill), rgb('#ffffff')) >= contrast(rgb(fill), rgb(TEXT_LIGHT))
    ? '#ffffff'
    : TEXT_LIGHT;

/** PHP's round(): halves away from zero. */
const phpRound = (n: number) => Math.sign(n) * Math.round(Math.abs(n));

/** Mixes `base` toward `toward` in small steps until `ok` accepts it. */
function shade(base: string, toward: string, ok: (c: Rgb) => boolean): string {
  const from = rgb(base);
  const to = rgb(toward);
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const mixed = from.map((a, j) => phpRound(a + (to[j] - a) * t)) as Rgb;
    if (ok(mixed)) return hex(mixed);
  }
  return toward;
}

/** `--theme-*` custom properties for a `#rrggbb` theme colour, in both modes. */
export function themeCssVars(base: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [mode, suffix] of [
    ['light', ''],
    ['dark', '-dark'],
  ] as const) {
    const toward = mode === 'light' ? '#000000' : '#ffffff';
    const surfaces = SURFACES[mode].map(rgb);
    // Fills also carry text (buttons, selected days), so the text on them needs 4.5:1 too.
    const fill = shade(
      base,
      toward,
      (c) => minContrast(c, surfaces) >= 3 && contrast(c, rgb(onColour(hex(c)))) >= 4.5,
    );
    vars[`--theme-primary${suffix}`] = fill;
    vars[`--theme-primary-text${suffix}`] = shade(
      base,
      toward,
      (c) => minContrast(c, surfaces) >= 4.5,
    );
    vars[`--theme-on-primary${suffix}`] = onColour(fill);
    vars[`--theme-primary-shade${suffix}`] = onColour(fill) === '#ffffff' ? '#000000' : '#ffffff';
  }
  return vars;
}
