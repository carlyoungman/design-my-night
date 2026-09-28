<?php

namespace DMN\Booking\Services;

use DMN\Booking\Config\Settings;
use DMN\Booking\Core\Database;

/**
 * Copies bookings for the imported venues from DesignMyNight into the `dmn_bookings` table, for
 * the Analytics section. Only booking facts are kept (reference, venue, activity, date and time,
 * group size, status, source, value, deposits, created and updated dates); no customer details.
 *
 * Uses the bookings search, GET /v4/bookings:
 * https://developers.designmynight.com/api/bookings-search/
 * DesignMyNight marks that endpoint as deprecated in favour of the Collins Bookings API
 * (https://docs.collinsbookings.com/#tag/Bookings); it is still the documented way to list
 * bookings with a DMN App ID, and it needs an API key that is allowed to read bookings. Without
 * that access, the sync records `no_permission` and Analytics shows widget data only.
 *
 * Each run fetches bookings updated since the last complete run (`last_updated` range), a page
 * at a time. A run stops after MAX_PAGES pages, or at the first error such as a rate limit, and
 * the next run continues from where it stopped.
 */
class BookingSync
{
  public const OPT_STATE = 'dmn_bookings_sync';
  /** Counts resets of the stored bookings (see reset()). */
  private const OPT_GENERATION = 'dmn_bookings_sync_generation';
  public const CRON_HOOK = 'dmn_sync_bookings';

  /** Option holding the sync lock (see acquire_lock()), and how long a lock is honoured. */
  private const LOCK = 'dmn_bookings_sync_lock';
  private const LOCK_TTL = 5 * MINUTE_IN_SECONDS;
  private const STATUSES = 'new,in_progress,complete,rejected,deleted,lost';
  private const PAGE_SIZE = 100;
  private const MAX_PAGES = 20;
  /** Seconds a run may spend before leaving the rest to the next run, well inside PHP's usual limit. */
  private const TIME_BUDGET = 20;
  /**
   * How far back (by last update) the first sync, or a sync after the venues change, reaches.
   * Not shortened by the retention setting: that works by visit date, so a booking made long
   * ago for an upcoming visit must still load. The daily purge removes what retention doesn't keep.
   */
  private const BACKFILL_DAYS = 365;
  /** After DMN refuses access, scheduled runs wait this long before asking again. */
  private const NO_PERMISSION_BACKOFF = DAY_IN_SECONDS;

  /** The stored sync state, with defaults. */
  public static function state(): array
  {
    $s = get_option(self::OPT_STATE, []);
    return array_merge([
      'finished_at' => null,
      'last_success_at' => null,
      'ok' => null,
      'error' => null,
      'error_code' => null,
      'count' => 0,
      'complete' => false,
      'watermark' => null,
      'cursor' => null,
      'scope' => null,
    ], is_array($s) ? $s : []);
  }

  /** What the admin app needs to know about the sync. */
  public static function public_state(): array
  {
    $s = self::state();
    return [
      'finished_at' => $s['finished_at'],
      'last_success_at' => $s['last_success_at'],
      'ok' => $s['ok'],
      'error' => $s['error'],
      'error_code' => $s['error_code'],
      'count' => (int)$s['count'],
      // False while a backfill or a long catch-up is still being fetched over several runs.
      'complete' => (bool)$s['complete'],
      'next_run_at' => wp_next_scheduled(self::CRON_HOOK) ?: null,
    ];
  }

  /** Hourly WP-Cron run. Backs off after DesignMyNight refuses access to bookings. */
  public static function cron(): void
  {
    $s = self::state();
    // New credentials or environment lift the pause straight away.
    if (
      $s['error_code'] === 'no_permission'
      && $s['finished_at']
      && time() - (int)$s['finished_at'] < self::NO_PERMISSION_BACKOFF
      && ($s['credentials'] ?? null) === self::credentials_hash()
    ) {
      return;
    }
    (new self())->run();
  }

  /**
   * Deletes the stored bookings and the sync state, so the next sync starts again with a full
   * backfill. Used when all imported data is removed.
   */
  public static function reset(): int
  {
    global $wpdb;
    // First, so a run still going can't have its progress resumed (see `generation` in sync()).
    update_option(self::OPT_GENERATION, self::generation() + 1, false);
    $deleted = (int)$wpdb->query('DELETE FROM ' . Database::bookings_table());
    delete_option(self::OPT_STATE);
    return $deleted;
  }

  /** Read from the database, so a reset in another request is seen. */
  private static function generation(): int
  {
    global $wpdb;
    return (int)$wpdb->get_var($wpdb->prepare(
      "SELECT option_value FROM {$wpdb->options} WHERE option_name = %s",
      self::OPT_GENERATION
    ));
  }

  /** Deletes stored bookings whose venue isn't one of these DMN IDs (all of them for none). */
  private static function delete_bookings_outside(array $venue_ids): void
  {
    global $wpdb;
    $table = Database::bookings_table();
    if (!$venue_ids) {
      $wpdb->query("DELETE FROM $table");
      return;
    }
    $wpdb->query($wpdb->prepare(
      "DELETE FROM $table WHERE venue_id NOT IN (" . implode(',', array_fill(0, count($venue_ids), '%s')) . ')',
      $venue_ids
    ));
  }

  /** Schedules the hourly run when it isn't scheduled yet. */
  public static function schedule(): void
  {
    if (!wp_next_scheduled(self::CRON_HOOK)) {
      wp_schedule_event(time() + 5 * MINUTE_IN_SECONDS, 'hourly', self::CRON_HOOK);
    }
  }

  public static function unschedule(): void
  {
    wp_clear_scheduled_hook(self::CRON_HOOK);
  }

  /**
   * Fetches bookings from DesignMyNight and stores them. Returns the new public state.
   */
  public function run(): array
  {
    $token = self::acquire_lock();
    if ($token === null) {
      return self::public_state() + ['busy' => true];
    }
    // A run stops starting new pages after TIME_BUDGET seconds, but the page in flight can take
    // another ~25 (request timeout plus one rate-limit retry), so allow for it. If PHP stops the
    // run anyway, release the lock so Refresh isn't blocked; the position is saved per page.
    if (function_exists('set_time_limit')) {
      @set_time_limit(90);
    }
    register_shutdown_function(static fn() => self::release_lock($token));

    try {
      $this->sync();
    } finally {
      self::release_lock($token);
    }

    return self::public_state();
  }

  /**
   * Takes the sync lock, or returns null when another run holds it. The lock is an options row
   * inserted with INSERT IGNORE, which only one run can win (add_option() would overwrite, as it
   * uses ON DUPLICATE KEY UPDATE), so two runs starting together can't both get it. The value
   * is "token|expiry"; a lock past its expiry was left by a run that died, and is taken over.
   */
  private static function acquire_lock(): ?string
  {
    $token = wp_generate_password(20, false);
    $value = $token . '|' . (time() + self::LOCK_TTL);
    if (self::insert_lock($value)) {
      return $token;
    }
    wp_cache_delete(self::LOCK, 'options');
    $held = (string)get_option(self::LOCK, '');
    $expires = (int)(explode('|', $held)[1] ?? 0);
    if ($held !== '' && $expires > time()) {
      return null;
    }
    // Remove the stale lock only if it is still the same one, then compete for it again.
    self::delete_lock_value($held);
    return self::insert_lock($value) ? $token : null;
  }

  private static function insert_lock(string $value): bool
  {
    global $wpdb;
    $inserted = $wpdb->query($wpdb->prepare(
      "INSERT IGNORE INTO {$wpdb->options} (option_name, option_value, autoload) VALUES (%s, %s, 'no')",
      self::LOCK,
      $value
    ));
    wp_cache_delete(self::LOCK, 'options');
    wp_cache_delete('notoptions', 'options');
    return $inserted === 1;
  }

  /** Releases the lock if this run still holds it. */
  private static function release_lock(string $token): void
  {
    global $wpdb;
    $wpdb->query($wpdb->prepare(
      "DELETE FROM {$wpdb->options} WHERE option_name = %s AND option_value LIKE %s",
      self::LOCK,
      $wpdb->esc_like($token . '|') . '%'
    ));
    wp_cache_delete(self::LOCK, 'options');
  }

  private static function delete_lock_value(string $value): void
  {
    global $wpdb;
    $wpdb->query($wpdb->prepare(
      "DELETE FROM {$wpdb->options} WHERE option_name = %s AND option_value = %s",
      self::LOCK,
      $value
    ));
    wp_cache_delete(self::LOCK, 'options');
  }

  private function sync(): void
  {
    $state = self::state();

    if (Settings::get_app_id() === '' || Settings::get_api_key() === '') {
      $this->fail($state, 'no_credentials', 'Add your App ID and API key under Settings > Connection to load bookings.');
      return;
    }

    $venue_ids = self::imported_venue_ids();
    if (!$venue_ids) {
      $this->fail($state, 'no_venues', 'Import your venues from DesignMyNight to load their bookings.');
      return;
    }

    // A new environment or a different set of venues starts again with a full backfill. After an
    // environment change the stored bookings belong to the other environment, so they go.
    // The generation changes on every reset(), so progress a run saved from before a reset can
    // never be resumed, even when the same venues are imported again.
    $scope = [
      'environment' => Settings::get_env(),
      'venues' => md5(implode(',', $venue_ids)),
      'generation' => self::generation(),
    ];
    $prev_scope = is_array($state['scope']) ? $state['scope'] : null;
    if ($prev_scope !== $scope) {
      global $wpdb;
      if ($prev_scope && ($prev_scope['environment'] ?? null) !== $scope['environment']) {
        $wpdb->query('DELETE FROM ' . Database::bookings_table());
      } else {
        // Venues no longer imported: their bookings would stop updating but keep counting.
        self::delete_bookings_outside($venue_ids);
      }
      $state['watermark'] = null;
      $state['cursor'] = null;
      $state['scope'] = $scope;
    }

    $cursor = is_array($state['cursor']) ? $state['cursor'] : [
      'since' => $state['watermark'] ?: gmdate('Y-m-d\TH:i:s', time() - self::BACKFILL_DAYS * DAY_IN_SECONDS),
      'start' => 0,
      'started_at' => time(),
    ];

    $client = new DmnClient();
    $stored = 0;

    $started = microtime(true);
    for ($page = 0; $page < self::MAX_PAGES && microtime(true) - $started < self::TIME_BUDGET; $page++) {
      // add_query_arg() doesn't encode values, and the range contains spaces and an asterisk.
      $resp = $client->request('GET', '/bookings', [
        'venue_id' => rawurlencode(implode(',', $venue_ids)),
        'last_updated' => rawurlencode($cursor['since'] . ' TO *'),
        // Every documented status, listed explicitly: the default isn't documented, and `all`
        // leaves out rejected, deleted and lost bookings, whose status changes must still arrive.
        'status' => rawurlencode(self::STATUSES),
        'sort' => 'created_date_asc',
        'start' => (int)$cursor['start'],
        'limit' => self::PAGE_SIZE,
      ], null, false);

      if (empty($resp['ok'])) {
        $state['cursor'] = $cursor;
        $state['count'] = $stored;
        [$code, $message] = self::describe_error($resp);
        $this->fail($state, $code, $message);
        return;
      }

      $payload = $resp['data']['payload'] ?? [];
      $bookings = is_array($payload['bookings'] ?? null) ? $payload['bookings'] : [];
      $found = (int)($payload['numFound'] ?? 0);

      foreach ($bookings as $b) {
        if (is_array($b) && self::store($b)) {
          $stored++;
        }
      }

      // The imported venues changed while this run was going (for example Start over removed
      // them): drop bookings for venues no longer imported, and forget this run's progress (saved
      // after earlier pages), so the next run starts again with a full backfill.
      $now_ids = self::imported_venue_ids();
      if ($now_ids !== $venue_ids) {
        self::delete_bookings_outside($now_ids);
        delete_option(self::OPT_STATE);
        return;
      }

      // Paging by position stays safe across runs: results are sorted by created date and filtered
      // on `last_updated >= since`, so bookings can join the set (when edited) but never leave it.
      // A booking joining before `start` shifts the rest along, which only means re-reading one
      // (stored again, harmlessly); the joining booking was updated after the run started, so the
      // next cycle, from the new watermark, fetches it.
      $cursor['start'] = (int)$cursor['start'] + count($bookings);
      if ($bookings && $cursor['start'] < $found) {
        // Saved after every page, so a run cut short by PHP's time limit resumes from here.
        $state['cursor'] = $cursor;
        $state['complete'] = false;
        update_option(self::OPT_STATE, $state, false);
      }
      if (!$bookings || $cursor['start'] >= $found) {
        // Everything updated since `since` is stored. The next run picks up changes from when
        // this one started, with a small overlap for clock differences.
        $state['watermark'] = gmdate('Y-m-d\TH:i:s', (int)$cursor['started_at'] - 5 * MINUTE_IN_SECONDS);
        $state['cursor'] = null;
        $state['complete'] = true;
        $this->succeed($state, $stored);
        // Drop what a backfill brought in beyond the retention period straight away.
        Analytics::purge(Settings::get_retention_days());
        return;
      }
    }

    // More pages remain: carry on next run.
    $state['cursor'] = $cursor;
    $state['complete'] = false;
    $this->succeed($state, $stored);
  }

  private function succeed(array $state, int $count): void
  {
    $state['finished_at'] = time();
    $state['last_success_at'] = time();
    $state['ok'] = true;
    $state['error'] = null;
    $state['error_code'] = null;
    $state['count'] = $count;
    update_option(self::OPT_STATE, $state, false);
  }

  /** Identifies the connection settings in use, without storing the key itself. */
  private static function credentials_hash(): string
  {
    return wp_hash(Settings::get_env() . '|' . Settings::get_app_id() . '|' . Settings::get_api_key());
  }

  private function fail(array $state, string $code, string $message): void
  {
    $state['credentials'] = self::credentials_hash();
    $state['finished_at'] = time();
    $state['ok'] = false;
    $state['error'] = $message;
    $state['error_code'] = $code;
    update_option(self::OPT_STATE, $state, false);
  }

  /** DMN IDs of the imported venues, sorted so the set can be compared between runs. */
  public static function imported_venue_ids(): array
  {
    global $wpdb;
    // Read from the database, not through get_posts()/post meta: those are cached for the request,
    // and a sync checks this again while running to notice venues removed by another request.
    $rows = $wpdb->get_col($wpdb->prepare(
      "SELECT pm.meta_value FROM {$wpdb->postmeta} pm
        JOIN {$wpdb->posts} p ON p.ID = pm.post_id
        WHERE p.post_type = %s AND p.post_status = %s AND pm.meta_key = %s",
      'dmn_venue',
      'publish',
      'dmn_venue_id'
    )) ?: [];
    $ids = [];
    foreach ($rows as $id) {
      $id = (string)$id;
      if ($id !== '' && preg_match('/^[A-Za-z0-9_-]{1,64}$/', $id)) {
        $ids[] = $id;
      }
    }
    $ids = array_values(array_unique($ids));
    sort($ids);
    return $ids;
  }

  /**
   * Error codes from https://developers.designmynight.com/api/api-basics/, as a code the admin
   * app can act on and a message that says what to do.
   */
  private static function describe_error(array $resp): array
  {
    $status = (int)($resp['status'] ?? 0);
    $detail = trim((string)($resp['error'] ?? ''));
    $said = $detail !== '' ? " DesignMyNight said: $detail" : '';

    if ($status === 401) {
      return ['bad_credentials', "DesignMyNight rejected the API credentials (HTTP 401). Check the App ID, API key and environment under Settings > Connection.$said"];
    }
    if ($status === 403) {
      return ['no_permission', "DesignMyNight didn't allow this API key to read bookings (HTTP 403). Ask DesignMyNight to enable booking access for your App ID, then refresh.$said"];
    }
    if ($status === 429) {
      return ['rate_limited', 'The hourly DesignMyNight request limit was reached. Bookings will continue loading on the next run.'];
    }
    if ($status === 0) {
      return ['request_failed', 'DesignMyNight could not be reached. Check the site can make outgoing requests, then try again.' . $said];
    }
    if ($status === 503) {
      return ['request_failed', 'DesignMyNight is temporarily unavailable. Try again later.'];
    }
    return ['request_failed', "DesignMyNight returned an error (HTTP $status).$said"];
  }

  /** Stores one booking from the search response. Returns false when it has no ID or venue. */
  private static function store(array $b): bool
  {
    global $wpdb;

    $id = self::id($b['_id'] ?? null);
    $venue = self::id($b['venue_id'] ?? null);
    if ($id === '' || $venue === '') {
      return false;
    }

    // `type` is documented as a map with only a `name`. Keep an ID when one is sent (as `id`,
    // `_id` or a plain string); otherwise reports match activities by name (Analytics).
    $type = $b['type'] ?? null;
    $type_id = is_array($type) ? self::id($type['id'] ?? ($type['_id'] ?? null)) : self::id($type);
    $type_name = is_array($type) && isset($type['name']) && is_scalar($type['name'])
      ? mb_substr(trim(sanitize_text_field((string)$type['name'])), 0, 191)
      : null;

    $deposit = null;
    if (is_array($b['deposits'] ?? null)) {
      foreach ($b['deposits'] as $d) {
        if (is_array($d) && is_numeric($d['amount'] ?? null)) {
          $deposit = ($deposit ?? 0) + (float)$d['amount'];
        }
      }
    }

    $time = is_string($b['time'] ?? null) && preg_match('/^([01]\d|2[0-3]):[0-5]\d/', $b['time'])
      ? substr($b['time'], 0, 5)
      : null;

    $row = [
      'dmn_id' => $id,
      // `booking_id` is the reference the customer sees (DMN-XXXXXXX).
      'reference' => self::reference($b['booking_id'] ?? ($b['reference'] ?? null)),
      'venue_id' => $venue,
      'type_id' => $type_id !== '' ? $type_id : null,
      'type_name' => $type_name,
      'booking_date' => self::date($b['date'] ?? null),
      'booking_time' => $time,
      'num_people' => max(0, min(65535, (int)($b['num_people'] ?? 0))),
      'status' => mb_substr(sanitize_key((string)($b['status'] ?? '')), 0, 32),
      'source' => isset($b['source']) && is_scalar($b['source']) ? mb_substr(sanitize_text_field((string)$b['source']), 0, 64) : null,
      // Not a listed bookings-search field, but the docs' `fields` example names
      // `estimated_value`; `value` is accepted too. Deposits are documented.
      'value' => self::money($b['estimated_value'] ?? ($b['value'] ?? null)),
      'deposit' => $deposit !== null ? round($deposit, 2) : null,
      'created_date' => self::datetime($b['created_date'] ?? null),
      'last_updated' => self::datetime($b['last_updated'] ?? null),
      'synced_at' => current_time('mysql', true),
    ];

    return $wpdb->replace(Database::bookings_table(), $row) !== false;
  }

  private static function money($v): ?float
  {
    return is_numeric($v) ? round((float)$v, 2) : null;
  }

  private static function reference($v): ?string
  {
    return is_scalar($v) && (string)$v !== '' ? mb_substr(sanitize_text_field((string)$v), 0, 64) : null;
  }

  /** A hex or numeric ID, or '' when it isn't one. */
  private static function id($v): string
  {
    if (is_array($v)) {
      $v = $v['$oid'] ?? ($v['_id'] ?? ($v['id'] ?? null));
    }
    $v = is_scalar($v) ? (string)$v : '';
    return preg_match('/^[A-Za-z0-9_-]{1,64}$/', $v) ? $v : '';
  }

  /** `Y-m-d` from a DMN date (documented as a UTC date/time), or null. */
  private static function date($v): ?string
  {
    if (!is_string($v) || !preg_match('/^\d{4}-\d{2}-\d{2}/', $v)) {
      return null;
    }
    // Documented as the booking's date in UTC, normally midnight ("2017-02-15T00:00:00"). A
    // timestamp with another time may be local midnight expressed in UTC (for example
    // 23:00Z the day before, in British summer time), so take its date in the site's time zone.
    if (preg_match('/^\d{4}-\d{2}-\d{2}T(\d{2}:\d{2})/', $v, $m) && $m[1] !== '00:00') {
      $ts = strtotime($v);
      if ($ts) {
        return wp_date('Y-m-d', $ts);
      }
    }
    return substr($v, 0, 10);
  }

  /** `Y-m-d H:i:s` in UTC from a DMN date/time, or null. */
  private static function datetime($v): ?string
  {
    if (!is_string($v) || $v === '') {
      return null;
    }
    $ts = strtotime($v);
    return $ts ? gmdate('Y-m-d H:i:s', $ts) : null;
  }
}
