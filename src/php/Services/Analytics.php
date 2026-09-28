<?php

namespace DMN\Booking\Services;

use DateTimeImmutable;
use DateTimeZone;
use DMN\Booking\Config\Settings;
use DMN\Booking\Core\Database;

/**
 * Reports for the Analytics section, read from the plugin's own tables (see Database): bookings
 * copied from DesignMyNight by BookingSync, and widget events recorded by `POST dmn/v1/events`.
 * Makes no DesignMyNight request.
 *
 * Filters (see `filters()`):
 * - `from`, `to`: dates (Y-m-d, inclusive) in the site's time zone.
 * - `basis`: `created` counts bookings by the day they were made, `visit` by the day they take place.
 * - `venue`, `type`: DMN venue and booking type IDs, or '' for all.
 */
class Analytics
{
  /** Statuses that don't count as bookings in totals (https://developers.designmynight.com/api/bookings-search/). */
  public const INACTIVE_STATUSES = ['rejected', 'deleted', 'lost'];

  /**
   * Widget steps in funnel order (src/frontend/app/utils/steps.ts), between opening and hand-off.
   * Group size isn't one: it is filled in with a default as soon as a venue is chosen.
   */
  public const STEPS = ['venue', 'date', 'experience', 'time', 'details'];

  /** Ranges longer than this are grouped by week. */
  private const DAILY_MAX_DAYS = 92;
  private const EXPORT_LIMIT = 20000;

  private array $f;
  private DateTimeZone $tz;
  /** Local dates of 15-minute UTC slots, cached (see local_day()). */
  private array $slot_days = [];

  public function __construct(array $filters)
  {
    $this->tz = wp_timezone();
    $this->f = $filters;
  }

  /**
   * Validates request parameters. Returns [filters, errors].
   */
  public static function filters(array $p): array
  {
    $tz = wp_timezone();
    $today = (new DateTimeImmutable('now', $tz))->format('Y-m-d');
    $errors = [];

    $from = (string)($p['from'] ?? '');
    $to = (string)($p['to'] ?? '');
    if ($from === '') {
      $from = (new DateTimeImmutable($today, $tz))->modify('-29 days')->format('Y-m-d');
    }
    if ($to === '') {
      $to = $today;
    }
    foreach (['from' => $from, 'to' => $to] as $k => $v) {
      $d = DateTimeImmutable::createFromFormat('!Y-m-d', $v, $tz);
      if (!$d || $d->format('Y-m-d') !== $v) {
        $errors[$k] = 'Enter a date as YYYY-MM-DD.';
      }
    }
    if (!$errors && $from > $to) {
      $errors['to'] = 'The end date must be on or after the start date.';
    }
    if (!$errors) {
      $days = self::days_between($from, $to) + 1;
      if ($days > 3 * 366) {
        $errors['from'] = 'Choose a range of three years or less.';
      }
    }

    $basis = ($p['basis'] ?? 'created') === 'visit' ? 'visit' : 'created';
    $venue = (string)($p['venue'] ?? '');
    $type = (string)($p['type'] ?? '');
    foreach (['venue' => $venue, 'type' => $type] as $k => $v) {
      if ($v !== '' && !preg_match('/^[A-Za-z0-9_-]{1,64}$/', $v)) {
        $errors[$k] = 'Unknown ' . ($k === 'venue' ? 'venue.' : 'activity.');
      }
    }

    return [compact('from', 'to', 'basis', 'venue', 'type'), $errors];
  }

  private static function days_between(string $a, string $b): int
  {
    return (int)(new DateTimeImmutable($a))->diff(new DateTimeImmutable($b))->days;
  }

  /** Everything the Analytics page shows above the bookings table, in one response. */
  public function report(): array
  {
    return [
      'filters' => $this->f,
      'summary' => $this->summary(),
      'timeseries' => $this->timeseries(),
      'funnel' => $this->funnel(),
      'breakdown' => $this->breakdown(),
      'timing' => $this->timing(),
      'data' => $this->data_status(),
    ];
  }

  /** Totals for the period and for the same number of days before it. */
  public function summary(): array
  {
    $days = self::days_between($this->f['from'], $this->f['to']) + 1;
    $prev_to = (new DateTimeImmutable($this->f['from']))->modify('-1 day');
    $prev_from = $prev_to->modify('-' . ($days - 1) . ' days');

    return [
      'period' => [
        'from' => $this->f['from'],
        'to' => $this->f['to'],
        'days' => $days,
        'previous_from' => $prev_from->format('Y-m-d'),
        'previous_to' => $prev_to->format('Y-m-d'),
      ],
      'current' => $this->totals($this->f['from'], $this->f['to']),
      'previous' => $this->totals($prev_from->format('Y-m-d'), $prev_to->format('Y-m-d')),
    ];
  }

  private function totals(string $from, string $to): array
  {
    global $wpdb;
    $t = Database::bookings_table();
    [$where, $args] = $this->bookings_where($from, $to);
    $inactive = self::in_list(self::INACTIVE_STATUSES);

    $row = $wpdb->get_row($wpdb->prepare(
      "SELECT
        SUM(status NOT IN ($inactive)) AS bookings,
        SUM(CASE WHEN status NOT IN ($inactive) THEN num_people ELSE 0 END) AS covers,
        SUM(CASE WHEN status NOT IN ($inactive) THEN value END) AS value,
        SUM(CASE WHEN status NOT IN ($inactive) THEN deposit END) AS deposits,
        SUM(status IN ($inactive)) AS inactive
      FROM $t $where",
      $args
    ), ARRAY_A) ?: [];

    $bookings = (int)($row['bookings'] ?? 0);
    $covers = (int)($row['covers'] ?? 0);
    [$views, $handoffs] = $this->widget_totals($from, $to);

    return [
      'bookings' => $bookings,
      'covers' => $covers,
      'value' => $row['value'] !== null ? round((float)$row['value'], 2) : null,
      'deposits' => $row['deposits'] !== null ? round((float)$row['deposits'], 2) : null,
      'average_party' => $bookings > 0 ? round($covers / $bookings, 1) : null,
      'inactive' => (int)($row['inactive'] ?? 0),
      'widget_views' => $views,
      'widget_handoffs' => $handoffs,
      // Share of widget visits that reached DesignMyNight's checkout.
      'conversion' => $views ? round($handoffs / $views, 4) : null,
    ];
  }

  /**
   * Visits (sessions that opened the widget) and hand-offs to DMN checkout. Visits aren't tied to
   * a venue or activity, so they are null while filtering by one.
   */
  private function widget_totals(string $from, string $to): array
  {
    global $wpdb;
    $t = Database::events_table();
    $filtered = $this->f['venue'] !== '' || $this->f['type'] !== '';
    [$where, $args] = $this->events_where($from, $to, true);
    // Unfiltered, only visitors who also opened the widget in the period count, so conversion
    // can't pass 100% when a visit spans the start of the period.
    [$in_views, $view_args] = $filtered ? ['', []] : $this->viewed_in($from, $to);
    $handoffs = (int)$wpdb->get_var($wpdb->prepare(
      "SELECT COUNT(DISTINCT session_id) FROM $t $where AND event = 'handoff' $in_views",
      array_merge($args, $view_args)
    ));

    if ($filtered) {
      return [null, $handoffs];
    }
    [$where, $args] = $this->events_where($from, $to, false);
    $views = (int)$wpdb->get_var($wpdb->prepare(
      "SELECT COUNT(DISTINCT session_id) FROM $t $where AND event = 'view'",
      $args
    ));
    return [$views, $handoffs];
  }

  /**
   * Bookings, covers, value and widget hand-offs per day, or per week (starting Monday) for
   * ranges over DAILY_MAX_DAYS. Every day or week in the range is present, with zeros.
   */
  public function timeseries(): array
  {
    global $wpdb;
    $b = Database::bookings_table();
    $e = Database::events_table();
    [$where, $args] = $this->bookings_where($this->f['from'], $this->f['to']);
    $inactive = self::in_list(self::INACTIVE_STATUSES);

    if ($this->f['basis'] === 'visit') {
      $rows = $wpdb->get_results($wpdb->prepare(
        "SELECT booking_date AS d, COUNT(*) AS bookings, SUM(num_people) AS covers, SUM(value) AS value
        FROM $b $where AND status NOT IN ($inactive) GROUP BY d",
        $args
      ), ARRAY_A) ?: [];
    } else {
      // Grouped by 15-minute UTC slot in SQL, then into local days here (see local_day()).
      $slot = self::slot('created_date');
      $rows = array_map(
        fn($r) => ['d' => $this->local_day((int)$r['q'])] + $r,
        $wpdb->get_results($wpdb->prepare(
          "SELECT $slot AS q, COUNT(*) AS bookings, SUM(num_people) AS covers, SUM(value) AS value
          FROM $b $where AND status NOT IN ($inactive) GROUP BY q",
          $args
        ), ARRAY_A) ?: []
      );
    }

    // Sessions that went to checkout, by local day. Unfiltered, only
    // visitors who opened the widget in the period count, as in the totals (widget_totals()).
    [$ewhere, $eargs] = $this->events_where($this->f['from'], $this->f['to'], true);
    [$in_views, $view_args] = $this->f['venue'] !== '' || $this->f['type'] !== ''
      ? ['', []]
      : $this->viewed_in($this->f['from'], $this->f['to']);
    $eslot = self::slot('created_at');
    $sessions_by_day = [];
    foreach ($wpdb->get_results($wpdb->prepare(
      "SELECT session_id, $eslot AS q FROM $e $ewhere AND event = 'handoff' $in_views GROUP BY session_id, q",
      array_merge($eargs, $view_args)
    ), ARRAY_A) ?: [] as $r) {
      $sessions_by_day[$this->local_day((int)$r['q'])][$r['session_id']] = true;
    }

    $days = self::days_between($this->f['from'], $this->f['to']) + 1;
    $weekly = $days > self::DAILY_MAX_DAYS;
    // Weeks are 7-day blocks from the start of the period, so only the last can be partial.
    $start = new DateTimeImmutable($this->f['from']);
    $bucket = function (string $d) use ($weekly, $start): string {
      if (!$weekly) {
        return $d;
      }
      $offset = intdiv(self::days_between($this->f['from'], $d), 7) * 7;
      return $start->modify("+$offset days")->format('Y-m-d');
    };

    $points = [];
    $cur = new DateTimeImmutable($this->f['from']);
    $end = new DateTimeImmutable($this->f['to']);
    while ($cur <= $end) {
      $k = $bucket($cur->format('Y-m-d'));
      $points[$k] ??= ['date' => $k, 'bookings' => 0, 'covers' => 0, 'value' => 0.0, 'handoffs' => 0];
      $cur = $cur->modify('+1 day');
    }
    foreach ($rows as $r) {
      if (!$r['d'] || !isset($points[$k = $bucket($r['d'])])) {
        continue;
      }
      $points[$k]['bookings'] += (int)$r['bookings'];
      $points[$k]['covers'] += (int)$r['covers'];
      $points[$k]['value'] += (float)$r['value'];
    }
    // Visitors are counted once per day or week, not once per day summed over a week.
    $sessions_by_point = [];
    foreach ($sessions_by_day as $d => $sessions) {
      if (isset($points[$k = $bucket($d)])) {
        $sessions_by_point[$k] = ($sessions_by_point[$k] ?? []) + $sessions;
      }
    }
    foreach ($sessions_by_point as $k => $sessions) {
      $points[$k]['handoffs'] = count($sessions);
    }
    foreach ($points as &$p) {
      $p['value'] = round($p['value'], 2);
    }

    return [
      'interval' => $weekly ? 'week' : 'day',
      'points' => array_values($points),
      // Days in the last week, which is shorter than 7 when the period isn't whole weeks.
      'last_days' => $weekly ? ($days % 7 ?: 7) : 1,
    ];
  }

  /**
   * Widget sessions that reached each step. A step is null when it can't be counted under the
   * current filters: opening the widget isn't tied to a venue, and steps before the experience
   * aren't tied to an activity.
   */
  public function funnel(): array
  {
    global $wpdb;
    $t = Database::events_table();
    $has_venue = $this->f['venue'] !== '';
    $has_type = $this->f['type'] !== '';
    [$where, $args] = $this->events_where($this->f['from'], $this->f['to'], true);
    // Starting from "opened the widget", later stages only count visitors who opened it in the
    // period, so no stage can be larger than the first.
    [$in_views, $view_args] = $has_venue || $has_type
      ? ['', []]
      : $this->viewed_in($this->f['from'], $this->f['to']);

    $counts = [];
    foreach ($wpdb->get_results($wpdb->prepare(
      "SELECT event, step, COUNT(DISTINCT session_id) AS n FROM $t $where $in_views GROUP BY event, step",
      array_merge($args, $view_args)
    ), ARRAY_A) ?: [] as $r) {
      $key = $r['event'] === 'step' ? (string)$r['step'] : (string)$r['event'];
      $counts[$key] = (int)$r['n'];
    }

    $views = null;
    if (!$has_venue && !$has_type) {
      [$vwhere, $vargs] = $this->events_where($this->f['from'], $this->f['to'], false);
      $views = (int)$wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(DISTINCT session_id) FROM $t $vwhere AND event = 'view'",
        $vargs
      ));
    }

    $stages = [['key' => 'view', 'count' => $views]];
    foreach (self::STEPS as $step) {
      $countable = !$has_type || in_array($step, ['experience', 'time', 'details'], true);
      $stages[] = ['key' => $step, 'count' => $countable ? ($counts[$step] ?? 0) : null];
    }
    $stages[] = ['key' => 'handoff', 'count' => $counts['handoff'] ?? 0];
    $errors = $counts['error'] ?? 0;

    return ['stages' => $stages, 'checkout_errors' => $errors];
  }

  /** Bookings by venue, activity, status and source. */
  public function breakdown(): array
  {
    global $wpdb;
    $t = Database::bookings_table();
    [$where, $args] = $this->bookings_where($this->f['from'], $this->f['to']);
    $inactive = self::in_list(self::INACTIVE_STATUSES);
    $names = self::names();

    $group = function (string $col, string $extra = '', int $limit = 0) use ($wpdb, $t, $where, $args) {
      // `l` is a name as DMN sent it, for labels when the key is lower-cased.
      $sql = "SELECT $col AS k, MIN(type_name) AS l, COUNT(*) AS bookings, SUM(num_people) AS covers, SUM(value) AS value
        FROM $t $where $extra GROUP BY k ORDER BY bookings DESC, k ASC";
      if ($limit) {
        $sql .= ' LIMIT ' . (int)$limit;
      }
      return $wpdb->get_results($wpdb->prepare($sql, $args), ARRAY_A) ?: [];
    };
    $row = fn(array $r, string $label) => [
      'key' => (string)$r['k'],
      'label' => $label,
      'bookings' => (int)$r['bookings'],
      'covers' => (int)$r['covers'],
      'value' => $r['value'] !== null ? round((float)$r['value'], 2) : null,
    ];

    $active = "AND status NOT IN ($inactive)";
    return [
      'venues' => array_map(
        fn($r) => $row($r, $names['venues'][$r['k']] ?? 'Venue not imported (' . $r['k'] . ')'),
        $group('venue_id', $active, 15)
      ),
      'types' => array_map(
        fn($r) => $row($r, self::type_label($names, $r['k'], $r['l'])),
        $group('COALESCE(type_id, LOWER(TRIM(type_name)))', $active, 15)
      ),
      'statuses' => array_map(
        fn($r) => $row($r, self::status_label((string)$r['k'])) + [
          'inactive' => in_array($r['k'], self::INACTIVE_STATUSES, true),
        ],
        $group('status')
      ),
      'sources' => array_map(
        fn($r) => $row($r, self::source_label((string)$r['k'])),
        $group("COALESCE(NULLIF(source, ''), 'unknown')", $active, 10)
      ),
    ];
  }

  /** When bookings take place (weekday × hour), how far ahead they're made, and group sizes. */
  public function timing(): array
  {
    global $wpdb;
    $t = Database::bookings_table();
    [$where, $args] = $this->bookings_where($this->f['from'], $this->f['to']);
    $inactive = self::in_list(self::INACTIVE_STATUSES);
    $active = "$where AND status NOT IN ($inactive)";

    // WEEKDAY(): 0 is Monday.
    $heat = [];
    foreach ($wpdb->get_results($wpdb->prepare(
      "SELECT WEEKDAY(booking_date) AS wd, CAST(SUBSTRING(booking_time, 1, 2) AS UNSIGNED) AS h, COUNT(*) AS n
      FROM $t $active AND booking_date IS NOT NULL AND booking_time IS NOT NULL GROUP BY wd, h",
      $args
    ), ARRAY_A) ?: [] as $r) {
      $heat[] = ['weekday' => (int)$r['wd'], 'hour' => (int)$r['h'], 'bookings' => (int)$r['n']];
    }

    // Days from the local day the booking was made to the visit.
    $slot = self::slot('created_date');
    $lead_counts = [];
    foreach ($wpdb->get_results($wpdb->prepare(
      "SELECT booking_date AS d, $slot AS q, COUNT(*) AS n FROM $t $active
        AND booking_date IS NOT NULL AND created_date IS NOT NULL GROUP BY d, q",
      $args
    ), ARRAY_A) ?: [] as $r) {
      $made = new DateTimeImmutable($this->local_day((int)$r['q']));
      $diff = (int)$made->diff(new DateTimeImmutable($r['d']))->format('%r%a');
      $k = $diff <= 0 ? 'same_day' : ($diff <= 2 ? '1_2' : ($diff <= 7 ? '3_7' : ($diff <= 14 ? '8_14'
        : ($diff <= 30 ? '15_30' : ($diff <= 60 ? '31_60' : '61_plus')))));
      $lead_counts[$k] = ($lead_counts[$k] ?? 0) + (int)$r['n'];
    }
    $lead = [];
    foreach ($lead_counts as $k => $n) {
      $lead[] = ['k' => $k, 'n' => $n];
    }

    $sizes = $wpdb->get_results($wpdb->prepare(
      "SELECT CASE
          WHEN num_people <= 1 THEN '1'
          WHEN num_people = 2 THEN '2'
          WHEN num_people <= 4 THEN '3_4'
          WHEN num_people <= 6 THEN '5_6'
          WHEN num_people <= 10 THEN '7_10'
          WHEN num_people <= 20 THEN '11_20'
          ELSE '21_plus' END AS k, COUNT(*) AS n
        FROM $t $active GROUP BY k",
      $args
    ), ARRAY_A) ?: [];

    $ordered = function (array $rows, array $labels): array {
      $by = array_column($rows, 'n', 'k');
      $out = [];
      foreach ($labels as $k => $label) {
        $out[] = ['key' => $k, 'label' => $label, 'bookings' => (int)($by[$k] ?? 0)];
      }
      return $out;
    };

    return [
      'heatmap' => $heat,
      'lead_time' => $ordered($lead, [
        'same_day' => 'Same day',
        '1_2' => '1–2 days',
        '3_7' => '3–7 days',
        '8_14' => '8–14 days',
        '15_30' => '15–30 days',
        '31_60' => '31–60 days',
        '61_plus' => 'Over 60 days',
      ]),
      'group_size' => $ordered($sizes, [
        '1' => '1',
        '2' => '2',
        '3_4' => '3–4',
        '5_6' => '5–6',
        '7_10' => '7–10',
        '11_20' => '11–20',
        '21_plus' => '21+',
      ]),
    ];
  }

  public const SORTS = ['booking_date', 'created_date', 'num_people', 'value', 'deposit', 'status'];

  /** A page of bookings matching the filters, every status included. */
  public function bookings(int $page, int $per_page, string $sort, string $order): array
  {
    global $wpdb;
    $t = Database::bookings_table();
    [$where, $args] = $this->bookings_where($this->f['from'], $this->f['to']);
    $sort = in_array($sort, self::SORTS, true) ? $sort : 'created_date';
    $order = strtolower($order) === 'asc' ? 'ASC' : 'DESC';
    $per_page = max(1, min(100, $per_page));
    $page = max(1, $page);

    $total = (int)$wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $t $where", $args));
    // Secondary sort keeps pages stable when many rows share a value.
    $tiebreak = $sort === 'booking_date' ? ", booking_time $order, dmn_id ASC" : ', dmn_id ASC';
    $rows = $wpdb->get_results($wpdb->prepare(
      // Rows without a value (such as no booking value) go last in either direction.
      "SELECT * FROM $t $where ORDER BY ($sort IS NULL) ASC, $sort $order$tiebreak LIMIT %d OFFSET %d",
      array_merge($args, [$per_page, ($page - 1) * $per_page])
    ), ARRAY_A) ?: [];

    $names = self::names();
    return [
      'total' => $total,
      'page' => $page,
      'per_page' => $per_page,
      'items' => array_map(fn($r) => $this->format_booking($r, $names), $rows),
    ];
  }

  private function format_booking(array $r, array $names): array
  {
    $type_key = $r['type_id'] ?: $r['type_name'];
    return [
      'id' => $r['dmn_id'],
      'reference' => $r['reference'],
      'venue_id' => $r['venue_id'],
      'venue' => $names['venues'][$r['venue_id']] ?? null,
      'type' => $type_key !== null ? self::type_label($names, $type_key, $r['type_name']) : null,
      'date' => $r['booking_date'],
      'time' => $r['booking_time'],
      'num_people' => (int)$r['num_people'],
      'status' => $r['status'],
      'status_label' => self::status_label((string)$r['status']),
      'source' => $r['source'],
      'value' => $r['value'] !== null ? (float)$r['value'] : null,
      'deposit' => $r['deposit'] !== null ? (float)$r['deposit'] : null,
      // UTC, as ISO 8601 so the browser shows it in the user's time zone.
      'created' => $r['created_date'] ? str_replace(' ', 'T', $r['created_date']) . 'Z' : null,
    ];
  }

  /**
   * CSV of the bookings matching the filters, or of the trend. Cells that a spreadsheet would
   * read as a formula are prefixed with an apostrophe.
   */
  public function export(string $kind): array
  {
    global $wpdb;
    $names = self::names();
    $lines = [];

    if ($kind === 'timeseries') {
      $series = $this->timeseries();
      $lines[] = [$series['interval'] === 'week' ? 'Week starting' : 'Date', 'Bookings', 'Covers', 'Booking value', 'Widget hand-offs'];
      foreach ($series['points'] as $p) {
        $lines[] = [$p['date'], $p['bookings'], $p['covers'], $p['value'], $p['handoffs']];
      }
    } else {
      $t = Database::bookings_table();
      [$where, $args] = $this->bookings_where($this->f['from'], $this->f['to']);
      $total = (int)$wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $t $where", $args));
      $rows = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM $t $where ORDER BY created_date DESC, dmn_id ASC LIMIT %d",
        array_merge($args, [self::EXPORT_LIMIT])
      ), ARRAY_A) ?: [];
      $lines[] = ['Reference', 'DMN booking ID', 'Venue', 'Activity', 'Date', 'Time', 'Guests', 'Status', 'Source', 'Booking value', 'Deposits', 'Created (UTC)'];
      foreach ($rows as $r) {
        $b = $this->format_booking($r, $names);
        $lines[] = [
          $b['reference'], $b['id'], $b['venue'] ?? $b['venue_id'], $b['type'], $b['date'], $b['time'],
          $b['num_people'], $b['status_label'], $b['source'], $b['value'], $b['deposit'], $r['created_date'],
        ];
      }
    }

    $csv = '';
    foreach ($lines as $line) {
      $csv .= implode(',', array_map([self::class, 'csv_cell'], $line)) . "\r\n";
    }
    $suffix = $this->f['from'] . '-to-' . $this->f['to'];
    return [
      'filename' => ($kind === 'timeseries' ? 'dmn-booking-trend-' : 'dmn-bookings-') . $suffix . '.csv',
      'csv' => $csv,
      // Rows in the file and rows matching the filters; they differ when EXPORT_LIMIT cut it short.
      'rows' => count($lines) - 1,
      'total' => $total ?? count($lines) - 1,
    ];
  }

  private static function csv_cell($v): string
  {
    $s = $v === null ? '' : (string)$v;
    if ($s !== '' && !is_int($v) && !is_float($v) && strpbrk($s[0], "=+-@\t\r") !== false) {
      $s = "'" . $s;
    }
    return '"' . str_replace('"', '""', $s) . '"';
  }

  /** Whether each data source has anything, for empty states, and the sync status. */
  public function data_status(): array
  {
    global $wpdb;
    return [
      'bookings_stored' => (int)$wpdb->get_var('SELECT COUNT(*) FROM ' . Database::bookings_table()),
      'events_stored' => (int)$wpdb->get_var('SELECT COUNT(*) FROM ' . Database::events_table()),
      // Booking value isn't a documented bookings-search field, so the admin shows deposits
      // instead when no stored booking has one.
      'has_value' => (bool)$wpdb->get_var('SELECT 1 FROM ' . Database::bookings_table() . ' WHERE value IS NOT NULL LIMIT 1'),
      'tracking' => Settings::get_tracking(),
      'retention_days' => Settings::get_retention_days(),
      'sync' => BookingSync::public_state(),
    ];
  }

  /** Venue and activity names by DMN ID, from the imported venues and activities. */
  public static function names(): array
  {
    static $names = null;
    if ($names !== null) {
      return $names;
    }
    // `types` by DMN ID; `type_titles` by lower-cased name, for bookings that only have a name.
    $names = ['venues' => [], 'types' => [], 'type_titles' => []];
    foreach (get_posts(['post_type' => 'dmn_venue', 'numberposts' => 1000, 'post_status' => 'any']) as $p) {
      $id = (string)get_post_meta($p->ID, 'dmn_venue_id', true);
      if ($id !== '') {
        $names['venues'][$id] = $p->post_title;
      }
    }
    foreach (get_posts(['post_type' => 'dmn_activity', 'numberposts' => 5000, 'post_status' => 'any']) as $p) {
      $id = (string)get_post_meta($p->ID, 'dmn_type_id', true);
      if ($id !== '') {
        $names['types'][$id] = $p->post_title;
      }
      $names['type_titles'][mb_strtolower(trim($p->post_title))] ??= $p->post_title;
    }
    return $names;
  }

  /** An activity's title from its DMN ID or name, else the name as DMN sent it. */
  private static function type_label(array $names, ?string $key, ?string $sent = null): string
  {
    if ($key === null || $key === '') {
      return 'No activity';
    }
    return $names['types'][$key]
      ?? $names['type_titles'][mb_strtolower(trim($key))]
      ?? (($sent !== null && trim($sent) !== '') ? trim($sent) : $key);
  }

  /**
   * Lower-cased names of the imported activities with this DMN booking type ID, by the DMN ID
   * of the venue each belongs to.
   */
  private static function type_names(string $type_id): array
  {
    $by_venue = [];
    foreach (get_posts([
      'post_type' => 'dmn_activity',
      'numberposts' => 1000,
      'post_status' => 'any',
      'meta_key' => 'dmn_type_id',
      'meta_value' => $type_id,
    ]) as $p) {
      $venue = (string)get_post_meta((int)$p->post_parent, 'dmn_venue_id', true);
      $name = mb_strtolower(trim($p->post_title));
      if ($venue !== '' && $name !== '') {
        $by_venue[$venue][$name] = $name;
      }
    }
    return array_map('array_values', $by_venue);
  }

  /** Venues and activities for the filter menus. */
  public static function filter_options(): array
  {
    $venues = [];
    $by_post = [];
    foreach (get_posts(['post_type' => 'dmn_venue', 'numberposts' => 1000, 'orderby' => 'title', 'order' => 'ASC']) as $p) {
      $id = (string)get_post_meta($p->ID, 'dmn_venue_id', true);
      if ($id !== '') {
        $venues[] = ['id' => $id, 'name' => $p->post_title];
        $by_post[$p->ID] = $id;
      }
    }
    $types = [];
    foreach (get_posts(['post_type' => 'dmn_activity', 'numberposts' => 5000, 'orderby' => 'title', 'order' => 'ASC']) as $p) {
      $id = (string)get_post_meta($p->ID, 'dmn_type_id', true);
      if ($id !== '' && isset($by_post[$p->post_parent])) {
        $types[] = ['id' => $id, 'name' => $p->post_title, 'venue_id' => $by_post[$p->post_parent]];
      }
    }
    return ['venues' => $venues, 'types' => $types];
  }

  /**
   * Deletes data older than the retention period: widget events by when they happened, bookings
   * by the day they take place (or were made, when DMN gave no date). Returns rows deleted.
   */
  public static function purge(int $days): int
  {
    global $wpdb;
    if ($days <= 0) {
      return 0;
    }
    $cutoff = gmdate('Y-m-d H:i:s', time() - $days * DAY_IN_SECONDS);
    $deleted = (int)$wpdb->query($wpdb->prepare(
      'DELETE FROM ' . Database::events_table() . ' WHERE created_at < %s',
      $cutoff
    ));
    $deleted += (int)$wpdb->query($wpdb->prepare(
      'DELETE FROM ' . Database::bookings_table()
      . ' WHERE (booking_date IS NOT NULL AND booking_date < %s) OR (booking_date IS NULL AND created_date < %s)',
      substr($cutoff, 0, 10),
      $cutoff
    ));
    return $deleted;
  }

  /** Daily WP-Cron run applying the retention setting. */
  public static function cron_purge(): void
  {
    self::purge(Settings::get_retention_days());
  }

  /**
   * Deletes every widget event and returns how many. Bookings stay: they are a copy of
   * DesignMyNight's records. Throws when the database refuses.
   */
  public static function delete_events(): int
  {
    global $wpdb;
    $table = Database::events_table();
    // DELETE rather than TRUNCATE: it only needs the DELETE privilege, and reports the rows removed.
    $deleted = $wpdb->query("DELETE FROM $table");
    if ($deleted === false) {
      throw new \RuntimeException('The database refused to delete the widget activity.' . ($wpdb->last_error ? ' ' . $wpdb->last_error : ''));
    }
    return (int)$deleted;
  }

  public static function status_label(string $status): string
  {
    $labels = [
      'new' => 'New',
      'in_progress' => 'In progress',
      'complete' => 'Complete',
      'rejected' => 'Rejected',
      'deleted' => 'Deleted',
      'lost' => 'Lost',
    ];
    return $labels[$status] ?? ($status !== '' ? ucfirst(str_replace('_', ' ', $status)) : 'Unknown');
  }

  public static function source_label(string $source): string
  {
    // The booking widget sends customers to DMN's checkout with `source: partner`.
    if ($source === 'partner') {
      return 'Partner sites (includes this site’s widget)';
    }
    if ($source === 'unknown') {
      return 'Not recorded';
    }
    return ucfirst(str_replace('_', ' ', $source));
  }

  /**
   * SQL for the 15-minute UTC slot of a UTC datetime column, counted from 1970. Every time zone's
   * offset is a whole number of quarter hours, so a slot never spans two local days; local_day()
   * then finds its date with the site's time zone rules, daylight saving included. (MySQL can't
   * convert named time zones without its time zone tables, which many hosts don't load.)
   */
  private static function slot(string $col): string
  {
    return "TIMESTAMPDIFF(MINUTE, '1970-01-01 00:00:00', $col) DIV 15";
  }

  /** The site-local date (Y-m-d) of a 15-minute UTC slot from slot(). */
  private function local_day(int $slot): string
  {
    return $this->slot_days[$slot] ??= (new DateTimeImmutable('@' . ($slot * 900)))
      ->setTimezone($this->tz)
      ->format('Y-m-d');
  }

  /** UTC bounds [start, end) for local dates from and to (inclusive). */
  private function utc_bounds(string $from, string $to): array
  {
    $utc = new DateTimeZone('UTC');
    $start = (new DateTimeImmutable($from . ' 00:00:00', $this->tz))->setTimezone($utc);
    $end = (new DateTimeImmutable($to . ' 00:00:00', $this->tz))->modify('+1 day')->setTimezone($utc);
    return [$start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')];
  }

  /** WHERE clause and arguments for bookings in a date range with the venue and activity filters. */
  private function bookings_where(string $from, string $to): array
  {
    if ($this->f['basis'] === 'visit') {
      $parts = ['booking_date BETWEEN %s AND %s'];
      $args = [$from, $to];
    } else {
      $parts = ['created_date >= %s AND created_date < %s'];
      $args = $this->utc_bounds($from, $to);
    }
    if ($this->f['venue'] !== '') {
      $parts[] = 'venue_id = %s';
      $args[] = $this->f['venue'];
    }
    if ($this->f['type'] !== '') {
      // DMN documents a booking's `type` as a map with only a `name`, so bookings without an ID
      // match by name: the activity titles, which each import sets from DMN's names, for every
      // venue that has this activity. Case and surrounding spaces are ignored.
      // Name matches are limited to the venue that has the activity, so another venue's
      // activity of the same name isn't counted.
      $by_venue = self::type_names($this->f['type']);
      if ($by_venue) {
        $or = [];
        $name_args = [];
        foreach ($by_venue as $venue => $names) {
          $or[] = '(venue_id = %s AND LOWER(TRIM(type_name)) IN ('
            . implode(',', array_fill(0, count($names), '%s')) . '))';
          array_push($name_args, (string)$venue, ...$names);
        }
        $parts[] = '(type_id = %s OR (type_id IS NULL AND (' . implode(' OR ', $or) . ')))';
        $args[] = $this->f['type'];
        array_push($args, ...$name_args);
      } else {
        $parts[] = 'type_id = %s';
        $args[] = $this->f['type'];
      }
    }
    return ['WHERE ' . implode(' AND ', $parts), $args];
  }

  /** WHERE clause for widget events in a date range, with the venue and activity filters when asked. */
  private function events_where(string $from, string $to, bool $filtered): array
  {
    $parts = ['created_at >= %s AND created_at < %s'];
    $args = $this->utc_bounds($from, $to);
    if ($filtered && $this->f['venue'] !== '') {
      $parts[] = 'venue_id = %s';
      $args[] = $this->f['venue'];
    }
    if ($filtered && $this->f['type'] !== '') {
      $parts[] = 'type_id = %s';
      $args[] = $this->f['type'];
    }
    return ['WHERE ' . implode(' AND ', $parts), $args];
  }

  /** SQL (with its arguments) limiting events to sessions that opened the widget in a range. */
  private function viewed_in(string $from, string $to): array
  {
    [$vwhere, $vargs] = $this->events_where($from, $to, false);
    $t = Database::events_table();
    return ["AND session_id IN (SELECT session_id FROM $t $vwhere AND event = 'view')", $vargs];
  }

  /** A quoted SQL list of fixed, known-safe strings. */
  private static function in_list(array $values): string
  {
    return implode(',', array_map(fn($v) => "'" . esc_sql($v) . "'", $values));
  }
}
