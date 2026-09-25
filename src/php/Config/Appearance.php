<?php

namespace DMN\Booking\Config;

/**
 * Theme colour and light/dark mode for the admin app and the booking widget.
 *
 * The theme colour replaces the default primary colour on both. It is written as `--theme-*`
 * custom properties on each root element (`.dmn-admin`, `.dmn-widget-root`); the stylesheets read
 * them in `src/shared/styles/_palette.scss`. Because any colour can be picked, it is shaded per
 * mode until it keeps enough contrast against that mode's surfaces: 3:1 for fills, borders and
 * focus rings, 4.5:1 where it is used as text.
 */
class Appearance
{
  public const OPT_THEME_COLOUR = 'dmn_theme_colour';
  public const OPT_ADMIN_MODE = 'dmn_admin_mode';     // 'light' | 'dark' | 'system'
  public const OPT_WIDGET_MODE = 'dmn_widget_mode';   // 'light' | 'dark' | 'system'

  public const DEFAULT_THEME_COLOUR = '#6750a4';
  public const MODES = ['light', 'dark', 'system'];

  /** Surface and background colours of each mode. Keep in step with `_palette.scss`. */
  private const SURFACES = [
    'light' => ['#ffffff', '#f8f7fa'],
    'dark' => ['#211f26', '#141218'],
  ];
  private const TEXT = ['light' => '#1d1b20', 'dark' => '#e6e0e9'];

  public static function get_theme_colour(): string
  {
    $c = sanitize_hex_color((string)get_option(self::OPT_THEME_COLOUR, self::DEFAULT_THEME_COLOUR));
    return $c ? self::normalise_hex($c) : self::DEFAULT_THEME_COLOUR;
  }

  public static function get_admin_mode(): string
  {
    return self::valid_mode((string)get_option(self::OPT_ADMIN_MODE, 'light'));
  }

  public static function get_widget_mode(): string
  {
    return self::valid_mode((string)get_option(self::OPT_WIDGET_MODE, 'light'));
  }

  public static function valid_mode(string $mode): string
  {
    return in_array($mode, self::MODES, true) ? $mode : 'light';
  }

  public static function to_array(): array
  {
    return [
      'theme_colour' => self::get_theme_colour(),
      'default_theme_colour' => self::DEFAULT_THEME_COLOUR,
      'admin_mode' => self::get_admin_mode(),
      'widget_mode' => self::get_widget_mode(),
      'css_vars' => self::css_vars(),
    ];
  }

  /**
   * Saves the fields present in $data. Returns field => message for invalid values, saving nothing
   * when there are any.
   */
  public static function set(array $data): array
  {
    $errors = [];
    $colour = null;
    if (array_key_exists('theme_colour', $data)) {
      $colour = sanitize_hex_color(trim((string)$data['theme_colour']));
      if (!$colour) $errors['theme_colour'] = __('Enter a hex colour such as #6750a4.', 'dmn-booking');
    }
    foreach (['admin_mode', 'widget_mode'] as $key) {
      if (array_key_exists($key, $data) && !in_array($data[$key], self::MODES, true)) {
        $errors[$key] = __('Choose light, dark or match device.', 'dmn-booking');
      }
    }
    if ($errors) return $errors;

    if ($colour) update_option(self::OPT_THEME_COLOUR, self::normalise_hex($colour));
    if (isset($data['admin_mode'])) update_option(self::OPT_ADMIN_MODE, $data['admin_mode']);
    if (isset($data['widget_mode'])) update_option(self::OPT_WIDGET_MODE, $data['widget_mode']);
    return [];
  }

  /**
   * Custom properties for the saved theme colour, in both modes, as name => value.
   */
  public static function css_vars(): array
  {
    $base = self::get_theme_colour();
    $vars = [];
    foreach (['light' => '', 'dark' => '-dark'] as $mode => $suffix) {
      $toward = $mode === 'light' ? '#000000' : '#ffffff';
      $surfaces = array_map([self::class, 'rgb'], self::SURFACES[$mode]);
      // Fills also carry text (buttons, selected days), so the text on them needs 4.5:1 too.
      $fill = self::shade($base, $toward, fn($c) => self::min_contrast($c, $surfaces) >= 3.0
        && self::contrast($c, self::rgb(self::on_colour(self::hex($c)))) >= 4.5);
      $vars["--theme-primary$suffix"] = $fill;
      $vars["--theme-primary-text$suffix"] = self::shade($base, $toward, fn($c) => self::min_contrast($c, $surfaces) >= 4.5);
      $vars["--theme-on-primary$suffix"] = self::on_colour($fill);
      // Hover shading goes away from the text colour on the fill, so that text gains contrast.
      $vars["--theme-primary-shade$suffix"] = self::on_colour($fill) === '#ffffff' ? '#000000' : '#ffffff';
    }
    return $vars;
  }

  /** The css_vars() as a `style` attribute value. Values are validated hex colours. */
  public static function style_attr(): string
  {
    $out = '';
    foreach (self::css_vars() as $name => $value) $out .= "$name:$value;";
    return $out;
  }

  /**
   * Mixes $hex toward $toward in small steps until $ok accepts it. Returns $hex unchanged when it
   * already passes.
   */
  private static function shade(string $hex, string $toward, callable $ok): string
  {
    $rgb = self::rgb($hex);
    $target = self::rgb($toward);
    for ($i = 0; $i <= 40; $i++) {
      $t = $i / 40;
      $mixed = array_map(fn($a, $b) => (int)round($a + ($b - $a) * $t), $rgb, $target);
      if ($ok($mixed)) return self::hex($mixed);
    }
    return $toward;
  }

  /** The lowest contrast of $rgb against any of $against. */
  private static function min_contrast(array $rgb, array $against): float
  {
    return min(array_map(fn($bg) => self::contrast($rgb, $bg), $against));
  }

  /** Text colour for a fill: whichever of the light and dark text colours contrasts more. */
  private static function on_colour(string $fill): string
  {
    $rgb = self::rgb($fill);
    $light = self::rgb('#ffffff');
    $dark = self::rgb(self::TEXT['light']);
    return self::contrast($rgb, $light) >= self::contrast($rgb, $dark) ? '#ffffff' : self::TEXT['light'];
  }

  /** WCAG 2 contrast ratio between two sRGB colours. */
  private static function contrast(array $a, array $b): float
  {
    $la = self::luminance($a);
    $lb = self::luminance($b);
    return (max($la, $lb) + 0.05) / (min($la, $lb) + 0.05);
  }

  private static function luminance(array $rgb): float
  {
    [$r, $g, $b] = array_map(function ($c) {
      $c /= 255;
      return $c <= 0.03928 ? $c / 12.92 : (($c + 0.055) / 1.055) ** 2.4;
    }, $rgb);
    return 0.2126 * $r + 0.7152 * $g + 0.0722 * $b;
  }

  private static function normalise_hex(string $hex): string
  {
    $hex = strtolower(ltrim($hex, '#'));
    if (strlen($hex) === 3) $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
    return '#' . $hex;
  }

  private static function rgb(string $hex): array
  {
    $hex = ltrim(self::normalise_hex($hex), '#');
    return [hexdec(substr($hex, 0, 2)), hexdec(substr($hex, 2, 2)), hexdec(substr($hex, 4, 2))];
  }

  private static function hex(array $rgb): string
  {
    return sprintf('#%02x%02x%02x', ...$rgb);
  }
}
