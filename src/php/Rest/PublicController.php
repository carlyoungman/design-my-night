<?php

namespace DMN\Booking\Rest;

use DMN\Booking\Config\Settings;
use DMN\Booking\Core\Database;
use DMN\Booking\Services\Analytics;
use DMN\Booking\Services\DmnClient;
use Throwable;
use WP_Error;
use WP_Post;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

class PublicController
{
  /**
   * POST /dmn/v1/create-booking
   */
  public static function create_booking(WP_REST_Request $req): WP_Error|WP_REST_Response
  {
    $body = $req->get_json_params();

    try {
      $dmn = new DmnClient();
      $resp = $dmn->request('POST', '/bookings', [], $body);
      return new WP_REST_Response($resp, 200);
    } catch (Throwable $e) {
      return new WP_Error('dmn_error', $e->getMessage(), ['status' => 400]);
    }
  }

  /**
   * Registers all public REST API routes for the DMN Booking plugin.
   */
  public function register_routes(): void
  {
    // GET /dmn/v1/venues
    register_rest_route('dmn/v1', '/venues', [
      'methods' => 'GET',
      'permission_callback' => '__return_true',
      'callback' => [$this, 'venues'],
    ]);

    // POST /dmn/v1/booking-availability
    register_rest_route('dmn/v1', '/booking-availability', [
      'methods' => 'POST',
      'permission_callback' => '__return_true',
      'callback' => [$this, 'availability'],
    ]);

    // POST /dmn/v1/create-booking
    register_rest_route('dmn/v1', '/create-booking', [
      'methods' => 'POST',
      'callback' => [self::class, 'create_booking'],
      'permission_callback' => '__return_true',
    ]);

    // POST /dmn/v1/events: anonymous booking widget events for the Analytics section. Public
    // because the widget is used by visitors; pages may be cached, so there is no nonce. It only
    // writes validated, size-limited rows and is rate limited per visitor.
    register_rest_route('dmn/v1', '/events', [
      'methods' => 'POST',
      'permission_callback' => '__return_true',
      'callback' => [$this, 'record_events'],
    ]);

    // GET /dmn/v1/booking-types
    register_rest_route('dmn/v1', '/booking-types', [
      'methods' => 'GET',
      'permission_callback' => '__return_true',
      'callback' => [$this, 'get_booking_types'],
      'args' => [
        'venue_id' => ['type' => 'string', 'required' => true],
        'date' => ['type' => 'string', 'required' => false],
        'num_people' => ['type' => 'integer', 'required' => false],
        'party_size' => ['type' => 'integer', 'required' => false],
        'allow_disabled' => ['type' => 'boolean', 'required' => false],
      ],
    ]);
  }

  /**
   * GET /dmn/v1/venues
   */
  public function venues(WP_REST_Request $req): WP_REST_Response
  {
    $query = [];
    if ($vg = $req->get_param('venue_group')) {
      $query['venue_group'] = sanitize_text_field($vg);
    }

    $query['fields'] = $req->get_param('fields')
      ? sanitize_text_field((string)$req->get_param('fields'))
      : 'path,name,title';

    $dmn = new DmnClient();
    $res = $dmn->request('GET', '/venues', $query);

    return new WP_REST_Response([
      'data' => $res['data'] ?? null,
      'status' => $res['status'] ?? 0,
      'error' => $res['error'] ?? null,
      'debug' => $res,
    ], $res['ok'] ? 200 : ($res['status'] ?: 500));
  }

  /**
   * POST /dmn/v1/booking-availability
   */
  public function availability(WP_REST_Request $req): WP_REST_Response
  {
    $p = $req->get_json_params() ?? [];
    $venueId = isset($p['venue_id']) ? sanitize_text_field((string)$p['venue_id']) : '';
    if ($venueId === '') {
      return new WP_REST_Response(['error' => 'venue_id required'], 400);
    }

    $fields = $req->get_param('fields');
    $q = [];
    if ($fields) {
      $q['fields'] = sanitize_text_field((string)$fields);
    }

    $payload = array_filter([
      'type' => isset($p['type']) ? sanitize_text_field((string)$p['type']) : null,
      'num_people' => isset($p['num_people']) ? (int)$p['num_people'] : null,
      'date' => isset($p['date']) ? sanitize_text_field((string)$p['date']) : null,
      'time' => isset($p['time']) ? sanitize_text_field((string)$p['time']) : null,
      'duration' => isset($p['duration']) ? (int)$p['duration'] : null,
      'source' => 'partner',
      'getOffers' => true,
    ], fn($v) => $v !== null);

    $dmn = new DmnClient();
    $res = $dmn->request('POST', "/venues/$venueId/booking-availability", $q, $payload);

    $validation = $res['validation'] ?? ($res['data']['payload']['validation'] ?? null);

    return new WP_REST_Response([
      'data' => $res['data'] ?? null,
      'status' => $res['status'] ?? 0,
      'error' => $res['error'] ?? null,
      'validation' => $validation,
      'debug' => $res,
    ], $res['ok'] ? 200 : ($res['status'] ?: 500));
  }

  /**
   * GET /dmn/v1/booking-types
   * Merge DMN suggested types with WP-configured activities,
   * filtering out activities where meta `visible` is `'0'` unless allow_disabled=1.
   */
  public function get_booking_types(WP_REST_Request $r): WP_REST_Response
  {
    $allow_disabled = filter_var($r->get_param('allow_disabled'), FILTER_VALIDATE_BOOLEAN);

    $venueExtId = sanitize_text_field((string)$r->get_param('venue_id'));
    if (!$venueExtId) {
      return new WP_REST_Response(['data' => [], 'reason' => 'missing_venue_id'], 200);
    }

    $date = $r->get_param('date') ?: gmdate('Y-m-d');
    $numPeople = (int)($r->get_param('num_people') ?: $r->get_param('party_size') ?: 2);

    // 1) DMN suggestions (venue-scoped + fields=type)
    $client = new DmnClient();
    $payload = ['num_people' => $numPeople, 'date' => $date];

    $dmnResp = $client->request(
      'POST',
      "/venues/$venueExtId/booking-availability",
      ['fields' => 'type'],
      $payload
    );

    $suggested = []; // [typeId => ['id','name','valid','message']]
    if (!empty($dmnResp['ok'])) {
      $data = $dmnResp['data'] ?? [];
      $validation = $data['payload']['validation'] ?? null;
      $sv = $validation['type']['suggestedValues'] ?? [];

      if (is_array($sv)) {
        foreach ($sv as $item) {
          $v = (is_array($item) && isset($item['value'])) ? $item['value'] : $item;
          $id = is_array($v) ? (string)($v['id'] ?? '') : (string)$v;
          if (!$id) continue;

          $name = is_array($v) ? (string)($v['name'] ?? $id) : $id;
          $valid = is_array($item) && array_key_exists('valid', $item) ? (bool)$item['valid'] : null;
          $message = is_array($item) && array_key_exists('message', $item) ? (string)($item['message'] ?? '') : null;

          $suggested[$id] = [
            'id' => $id,
            'name' => $name,
            'valid' => $valid,
            'message' => $message,
          ];
        }
      }
    }

    // 2) WP-configured activities under the matching venue post (filter disabled unless allow_disabled)
    $venuePosts = get_posts([
      'post_type' => 'dmn_venue',
      'numberposts' => 1,
      'fields' => 'ids',
      'meta_key' => 'dmn_venue_id',
      'meta_value' => $venueExtId,
    ]);

    $configuredById = [];
    $hideUnavailable = false;

    if ($venuePosts) {
      $venuePostId = (int)$venuePosts[0];
      $hideUnavailable = get_post_meta($venuePostId, 'dmn_hide_unavailable', true) === '1';

      $acts = get_posts([
        'post_type' => 'dmn_activity',
        'post_parent' => $venuePostId,
        'numberposts' => 1000,
      ]);

      foreach ($acts as $p) {
        /** @var WP_Post $p */

        $is_visible = get_post_meta($p->ID, 'visible', true) !== '0';
        if (!$allow_disabled && !$is_visible) {
          continue;
        }

        $typeId = (string)get_post_meta($p->ID, 'dmn_type_id', true);
        if (!$typeId) continue;

        $imgId = (int)get_post_thumbnail_id($p->ID);
        $duration = (int)get_post_meta($p->ID, '_dmn_duration_minutes', true);

        $configuredById[$typeId] = [
          'id' => $typeId,
          'name' => get_the_title($p->ID),
          'description' => (string)get_post_meta($p->ID, 'short_description', true),
          'priceText' => (string)get_post_meta($p->ID, 'price_text', true),
          'image_id' => $imgId ?: null,
          'image_url' => $imgId ? wp_get_attachment_image_url($imgId, 'large') : null,
          'duration' => $duration > 0 ? $duration : null,
          'price_mode' => ($m = (string)get_post_meta($p->ID, 'dmn_price_mode', true)) && in_array($m, ['per_person', 'per_room', 'display'], true)
            ? $m
            : 'per_person',
          'visible' => $is_visible,
        ];
      }
    }

    // 3) Merge DMN + WP
    // FIX: don’t drop WP-configured types that aren’t in DMN suggestedValues.
    $out = [];
    $seen = [];

    // A) suggested first (only if configured in WP)
    if (!empty($suggested)) {
      foreach ($suggested as $id => $base) {
        $conf = $configuredById[$id] ?? null;
        if ($conf === null) continue;

        $valid = array_key_exists('valid', $base) ? $base['valid'] : null;

        // Venue setting: leave out types DMN reports as unavailable for this date and group size.
        if ($hideUnavailable && $valid === false) {
          $seen[$id] = true;
          continue;
        }
        $msg = array_key_exists('message', $base) ? ($base['message'] ?? '') : '';

        // The unavailable reason goes in `message` only; the widget shows it under the description.
        $out[] = [
          'id' => $id,
          'name' => $conf['name'] ?? $base['name'],
          'description' => $conf['description'] ?? '',
          'priceText' => $conf['priceText'] ?? '',
          'image_id' => $conf['image_id'] ?? null,
          'image_url' => $conf['image_url'] ?? null,
          'valid' => $valid,
          'message' => $msg ?: null,
          'duration' => $conf['duration'] ?? null,
          'price_mode' => $conf['price_mode'] ?? 'per_person',
          'visible' => $conf['visible'] ?? true,
        ];

        $seen[$id] = true;
      }
    }

    // B) append any configured types not in suggestions
    foreach ($configuredById as $id => $conf) {
      if (isset($seen[$id])) continue;

      $out[] = [
        'id' => $conf['id'],
        'name' => $conf['name'],
        'description' => $conf['description'],
        'priceText' => $conf['priceText'],
        'image_id' => $conf['image_id'],
        'image_url' => $conf['image_url'],
        'valid' => null,
        'message' => null,
        'duration' => $conf['duration'] ?? null,
        'price_mode' => $conf['price_mode'] ?? 'per_person',
        'visible' => $conf['visible'] ?? true,
      ];
    }

    // Stable partition: preserve original order, push invalid to end.
    $valid_rows = [];
    $invalid_rows = [];

    foreach ($out as $row) {
      ($row['valid'] ?? null) === false ? $invalid_rows[] = $row : $valid_rows[] = $row;
    }

    $out = array_merge($valid_rows, $invalid_rows);

    return new WP_REST_Response(['data' => $out], 200);
  }

  /**
   * Events accepted per batch, and per IP address in RATE_WINDOW seconds. The limit is generous
   * because visitors behind a proxy or CDN can share one address. There is no per-session limit:
   * a client can make up session IDs, and reports count each session once anyway.
   */
  private const EVENTS_PER_BATCH = 20;
  private const EVENTS_PER_IP = 5000;
  private const RATE_WINDOW = 600;

  /**
   * POST /dmn/v1/events
   *
   * Body: `{ session: "<32 hex>", events: [{ event, step?, venue_id?, type_id?, num_people? }] }`.
   * `event` is `view` (the widget opened), `step` (a step was completed; `step` names it),
   * `handoff` (the customer was sent to DesignMyNight's checkout) or `error` (checkout couldn't
   * start, for example because the time was no longer available). Nothing that identifies the visitor is stored: the session is a random ID the
   * widget keeps for the browser tab, and the IP address is only used, hashed, for rate limiting.
   */
  public function record_events(WP_REST_Request $req): WP_REST_Response
  {
    if (!Settings::get_tracking()) {
      return new WP_REST_Response(null, 204);
    }

    // sendBeacon may not send a JSON content type, so read the raw body.
    $body = json_decode((string)$req->get_body(), true);
    $session = is_array($body) ? (string)($body['session'] ?? '') : '';
    $events = is_array($body) && is_array($body['events'] ?? null) ? $body['events'] : null;
    if (!preg_match('/^[a-f0-9]{32}$/', $session) || $events === null || array_values($events) !== $events) {
      return new WP_REST_Response(['code' => 'dmn_invalid_events', 'message' => 'Invalid events.'], 400);
    }
    $events = array_slice($events, 0, self::EVENTS_PER_BATCH);

    $ip = isset($_SERVER['REMOTE_ADDR']) ? (string)$_SERVER['REMOTE_ADDR'] : '';
    $limits = [
      'dmn_evi_' . substr(hash_hmac('sha256', $ip, wp_salt('nonce')), 0, 32) => self::EVENTS_PER_IP,
    ];
    // A best-effort cap against abuse, not an exact quota: concurrent requests can each read the
    // same count, which only lets a burst go a little over.
    // Fixed windows: each counter keeps the time its window started, so steady traffic can't
    // keep extending it (renewing a transient on every write would never let it reset).
    $now = time();
    $counters = [];
    foreach ($limits as $key => $max) {
      $c = get_transient($key);
      $c = is_array($c) && isset($c['n'], $c['start']) && $now - (int)$c['start'] < self::RATE_WINDOW
        ? $c
        : ['n' => 0, 'start' => $now];
      if ((int)$c['n'] + count($events) > $max) {
        return new WP_REST_Response(['code' => 'dmn_rate_limited', 'message' => 'Too many events.'], 429);
      }
      $counters[$key] = $c;
    }
    foreach ($counters as $key => $c) {
      $c['n'] = (int)$c['n'] + count($events);
      set_transient($key, $c, max(1, self::RATE_WINDOW - ($now - (int)$c['start'])));
    }

    global $wpdb;
    $table = Database::events_table();
    $now = current_time('mysql', true);
    $id = fn($v) => is_string($v) && preg_match('/^[A-Za-z0-9_-]{1,64}$/', $v) ? $v : null;
    $stored = 0;

    foreach ($events as $e) {
      if (!is_array($e)) {
        continue;
      }
      $event = (string)($e['event'] ?? '');
      if (!in_array($event, ['view', 'step', 'handoff', 'error'], true)) {
        continue;
      }
      $step = null;
      if ($event === 'step') {
        $step = (string)($e['step'] ?? '');
        if (!in_array($step, Analytics::STEPS, true)) {
          continue;
        }
      }
      $people = isset($e['num_people']) && is_int($e['num_people']) && $e['num_people'] >= 1 && $e['num_people'] <= 1000
        ? $e['num_people']
        : null;

      $ok = $wpdb->insert($table, [
        'session_id' => $session,
        'event' => $event,
        'step' => $step,
        'venue_id' => $id($e['venue_id'] ?? null),
        'type_id' => $id($e['type_id'] ?? null),
        'num_people' => $people,
        'created_at' => $now,
      ]);
      if ($ok) {
        $stored++;
      }
    }

    return new WP_REST_Response(['stored' => $stored], 200);
  }

}
