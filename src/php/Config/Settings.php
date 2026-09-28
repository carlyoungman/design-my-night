<?php

namespace DMN\Booking\Config;

class Settings
{
  public const OPT_APP_ID = 'dmn_app_id';
  public const OPT_API_KEY = 'dmn_api_key';
  public const OPT_ENV = 'dmn_environment';           // 'prod' | 'qa'
  public const OPT_VG = 'dmn_default_venue_group';
  public const OPT_DEBUG = 'dmn_debug_mode';          // '0' | '1'
  public const OPT_TRACKING = 'dmn_analytics_tracking'; // Record anonymous widget events
  public const OPT_RETENTION = 'dmn_analytics_retention_days'; // 0 keeps analytics data forever

  public const RETENTION_DEFAULT = 365;
  public const RETENTION_MAX = 3650;

  public static function get_tracking(): bool
  {
    return (bool)get_option(self::OPT_TRACKING, true);
  }

  public static function get_retention_days(): int
  {
    $days = (int)get_option(self::OPT_RETENTION, self::RETENTION_DEFAULT);
    return max(0, min(self::RETENTION_MAX, $days));
  }

  /**
   * Saves the analytics settings. Returns field errors, keyed by field, or an empty array.
   */
  public static function set_analytics(array $data): array
  {
    $errors = [];
    if (array_key_exists('retention_days', $data)) {
      $days = $data['retention_days'];
      if (!is_numeric($days) || (int)$days != $days || (int)$days < 0 || (int)$days > self::RETENTION_MAX) {
        $errors['retention_days'] = sprintf(
          'Enter a whole number of days from 0 to %d (0 keeps data forever).',
          self::RETENTION_MAX
        );
      }
    }
    if ($errors) {
      return $errors;
    }
    if (array_key_exists('retention_days', $data)) {
      update_option(self::OPT_RETENTION, (int)$data['retention_days']);
    }
    if (array_key_exists('tracking', $data)) {
      // A string: update_option() skips saving false for an option that doesn't exist yet.
      update_option(self::OPT_TRACKING, $data['tracking'] ? '1' : '0');
    }
    return [];
  }

  public static function get_app_id(): string
  {
    return (string)get_option(self::OPT_APP_ID, '');
  }

  public static function get_api_key(): string
  {
    return (string)get_option(self::OPT_API_KEY, '');
  }

  public static function get_env(): string
  {
    $e = (string)get_option(self::OPT_ENV, 'prod');
    return in_array($e, ['qa', 'prod'], true) ? $e : 'prod';
  }

  public static function get_vg(): string
  {
    return (string)get_option(self::OPT_VG, '');
  }

  public static function get_debug(): bool
  {
    return (bool)get_option(self::OPT_DEBUG, false);
  }

  public static function set(array $data): void
  {
    if (isset($data['app_id'])) update_option(self::OPT_APP_ID, sanitize_text_field((string)$data['app_id']));
    if (array_key_exists('api_key', $data)) {
      $val = (string)$data['api_key'];
      if (trim($val) !== '') update_option(self::OPT_API_KEY, sanitize_text_field($val));
    }
    if (isset($data['environment'])) {
      $env = in_array($data['environment'], ['prod', 'qa'], true) ? $data['environment'] : 'prod';
      update_option(self::OPT_ENV, $env);
    }
    if (isset($data['venue_group'])) update_option(self::OPT_VG, sanitize_text_field((string)$data['venue_group']));
    if (isset($data['debug_mode'])) update_option(self::OPT_DEBUG, (bool)$data['debug_mode']);
  }

  public static function mask(string $key): string
  {
    if ($key === '') return '';
    return substr($key, 0, 2) . str_repeat('•', max(0, strlen($key) - 6)) . substr($key, -4);
  }
}
