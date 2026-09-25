<?php

namespace DMN\Booking\Rest;

use DateInterval;
use DMN\Booking\Config\Appearance;
use DMN\Booking\Config\Settings;
use DMN\Booking\Services\DmnClient;
use Exception;
use Throwable;
use WP_Error;
use WP_Post;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use function add_post_meta;
use function update_post_meta;
use function wp_insert_post;
use function wp_strip_all_tags;
use function wp_update_post;

class AdminController
{
  /** Option holding the outcome of the most recent import, shown on the admin dashboard. */
  public const OPT_LAST_IMPORT = 'dmn_last_import';

  /** Problems met during the current import, for the dashboard. */
  private array $import_issues = [];

  /** Set when the venue list itself could not be read during the current import. */
  private ?string $import_error = null;


  /**
   * Register admin REST routes.
   *
   * Notes
   * - Keeps existing route shapes and permissions.
   */
  public function register_routes(): void
  {
    // Test connection
    register_rest_route('dmn/v1/admin', '/test', [
      'methods' => WP_REST_Server::READABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'test_connection'],
    ]);

    // Settings: GET
    register_rest_route('dmn/v1/admin', '/settings', [
      'methods' => WP_REST_Server::READABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => function () {
        return new WP_REST_Response([
          'app_id' => Settings::get_app_id(),
          'api_key_mask' => Settings::mask(Settings::get_api_key()),
          'environment' => Settings::get_env(),
          'venue_group' => Settings::get_vg(),
          'debug_mode' => Settings::get_debug(),
          'has_key' => Settings::get_api_key() !== '',
        ], 200);
      },
    ]);

    // Settings: POST
    register_rest_route('dmn/v1/admin', '/settings', [
      'methods' => WP_REST_Server::CREATABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => function (WP_REST_Request $req) {
        Settings::set($req->get_json_params() ?? []);
        return new WP_REST_Response([
          'ok' => true,
          'environment' => Settings::get_env(),
          'debug_mode' => Settings::get_debug(),
          'venue_group' => Settings::get_vg(),
        ], 200);
      },
    ]);

    // Appearance: theme colour and light/dark mode for the admin and the widget, and the widget styles toggle.
    register_rest_route('dmn/v1/admin', '/appearance', [
      [
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => fn() => current_user_can('manage_options'),
        'callback' => fn() => new WP_REST_Response(Appearance::to_array(), 200),
      ],
      [
        'methods' => WP_REST_Server::CREATABLE,
        'permission_callback' => fn() => current_user_can('manage_options'),
        'callback' => function (WP_REST_Request $req) {
          $errors = Appearance::set($req->get_json_params() ?? []);
          if ($errors) {
            return new WP_Error('dmn_invalid_appearance', reset($errors), [
              'status' => 400,
              'fields' => $errors,
            ]);
          }
          return new WP_REST_Response(['ok' => true] + Appearance::to_array(), 200);
        },
      ],
    ]);

    /**
     * URL parameters (global) – used to append values to the DMN booking URL.
     */

    // GET: list URL params
    register_rest_route('dmn/v1/admin', '/url-params', [
      'methods' => WP_REST_Server::READABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => function () {
        $stored = get_option('dmn_booking_url_params', []);
        if (!is_array($stored)) {
          $stored = [];
        }

        $items = [];
        foreach ($stored as $row) {
          if (!is_array($row)) {
            continue;
          }
          $name = isset($row['name']) ? (string)$row['name'] : '';
          $value = isset($row['value']) ? (string)$row['value'] : '';

          if ($name === '') {
            continue;
          }

          $items[] = [
            'name' => $name,
            'value' => $value,
          ];
        }

        return new WP_REST_Response(['items' => $items], 200);
      },
    ]);

    // POST: save URL params
    register_rest_route('dmn/v1/admin', '/url-params', [
      'methods' => WP_REST_Server::CREATABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => function (WP_REST_Request $req) {
        $params = $req->get_json_params();
        $items = isset($params['items']) && is_array($params['items']) ? $params['items'] : [];

        $clean = [];
        foreach ($items as $row) {
          if (!is_array($row)) {
            continue;
          }

          $nameRaw = isset($row['name']) ? (string)$row['name'] : '';
          // Force into a query-friendly key (letters/numbers/_/-)
          $name = sanitize_key($nameRaw);
          $value = isset($row['value']) ? sanitize_text_field((string)$row['value']) : '';

          if ($name === '') {
            continue;
          }

          $clean[] = [
            'name' => $name,
            'value' => $value,
          ];
        }

        update_option('dmn_booking_url_params', $clean);

        return new WP_REST_Response([
          'ok' => true,
          'items' => $clean,
        ], 200);
      },
    ]);


    // Venues: list
    register_rest_route('dmn/v1/admin', '/venues', [
      'methods' => WP_REST_Server::READABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_list_venues'],
    ]);

    // Venues: sync
    register_rest_route('dmn/v1/admin', '/sync/venues', [
      'methods' => WP_REST_Server::CREATABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_sync_venues'],
    ]);

    // Venues: update widget settings
    register_rest_route('dmn/v1/admin', '/venues/(?P<id>\d+)', [
      'methods' => WP_REST_Server::CREATABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_save_venue'],
      'args' => [
        'id' => ['type' => 'integer', 'required' => true],
        'hide_unavailable' => ['type' => 'boolean', 'required' => false],
      ],
    ]);

    // Types: sync for all venues
    register_rest_route('dmn/v1/admin', '/sync/types', [
      'methods' => WP_REST_Server::CREATABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_sync_types_all'],
    ]);

    // Activities: list by venue
    register_rest_route('dmn/v1/admin', '/venues/(?P<venue>\d+)/activities', [
      'methods' => WP_REST_Server::READABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_list_activities'],
      'args' => ['venue' => ['type' => 'integer', 'required' => true]],
    ]);

    // Activities: update
    register_rest_route('dmn/v1/admin', '/activities/(?P<id>\d+)', [
      'methods' => WP_REST_Server::CREATABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_save_activity'],
      'args' => ['id' => ['type' => 'integer', 'required' => true]],
    ]);

    // Dashboard: last import and connection summary (no DMN request)
    register_rest_route('dmn/v1/admin', '/overview', [
      'methods' => WP_REST_Server::READABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_overview'],
    ]);

    // Sync all
    register_rest_route('dmn/v1/admin', '/sync/all', [
      'methods' => WP_REST_Server::CREATABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_sync_all'],
    ]);
  }


  /**
   * Test DMN API connectivity using /venues.
   *
   * @param WP_REST_Request $req Request with optional 'debug' and 'venue_group'.
   * @return WP_REST_Response Response with status, headers, sample, and debug.
   */
  public function test_connection(WP_REST_Request $req): WP_REST_Response
  {
    $debug = $req->get_param('debug') !== null
      ? (bool)$req->get_param('debug')
      : Settings::get_debug();

    $vg = $req->get_param('venue_group') ?: Settings::get_vg();
    $q = [];
    if ($vg) $q['venue_group'] = $vg;

    $client = new DmnClient();

    $t0 = microtime(true);
    $r = $client->request('GET', '/venues', $q);
    $t1 = microtime(true);

    $debugPayload = null;
    if ($debug) {
      $app = Settings::get_app_id();
      $key = Settings::get_api_key();
      $mask = static function (string $s) {
        return $s ? substr($s, 0, 2) . '••••' . substr($s, -2) : '';
      };

      $respHeaders = $r['response_headers'] ?? null;
      $requestId = $respHeaders['x-request-id'] ?? ($respHeaders['x-amzn-requestid'] ?? null);

      $debugPayload = [
        'base_url' => (Settings::get_env() === 'qa' ? 'https://api-qa.designmynight.com/v4' : 'https://api.designmynight.com/v4'),
        'path' => '/venues',
        'query' => $q,
        'auth_format' => 'APP_ID:API_KEY',
        'auth_mask' => $mask($app) . ':' . $mask($key),
        'auth_lengths' => ['app_id' => strlen($app), 'api_key' => strlen($key)],
        'duration_ms' => round(($t1 - $t0) * 1000),
        'response_headers' => $respHeaders,
        'request_id' => $requestId,
      ];

      if (!$r['ok']) {
        $debugPayload['dmn_message'] = $r['error'] ?? null;
        $debugPayload['dmn_raw_body'] = $r['raw_body'] ?? null;
      } else {
        $debugPayload['sample_count'] = count($r['data']['payload']['pages'] ?? []);
      }
    }

    if (!$r['ok']) {
      return new WP_REST_Response([
        'ok' => false,
        'status' => $r['status'],
        'error' => $r['error'] ?? 'Unauthorized or request failed',
        'headers' => $r['headers'],
        'debug' => $debugPayload,
      ], 200);
    }

    return new WP_REST_Response([
      'ok' => true,
      'status' => $r['status'],
      'headers' => $r['headers'],
      'sample' => array_slice($r['data']['payload']['pages'] ?? [], 0, 3),
      'debug' => $debugPayload,
    ], 200);
  }

  /**
   * List dmn_venue posts with a summary of their activities for the venues overview.
   *
   * @return WP_REST_Response Response with 'venues'.
   */
  public function dmn_admin_list_venues(): WP_REST_Response
  {
    $posts = get_posts([
      'post_type' => 'dmn_venue',
      'numberposts' => 1000,
      'orderby' => 'title',
      'order' => 'ASC',
    ]);

    // One query for every venue's activities; get_posts primes the meta cache for the loop below.
    $activities = get_posts([
      'post_type' => 'dmn_activity',
      'numberposts' => -1,
      'post_parent__in' => $posts ? wp_list_pluck($posts, 'ID') : [0],
    ]);

    $summary = [];
    foreach ($activities as $a) {
      $s = $summary[$a->post_parent] ?? ['total' => 0, 'visible' => 0, 'without_image' => 0];
      $s['total']++;
      if (get_post_meta($a->ID, 'visible', true) !== '0') $s['visible']++;
      if (!get_post_thumbnail_id($a->ID)) $s['without_image']++;
      $summary[$a->post_parent] = $s;
    }

    $venues = array_map(function (WP_Post $p) use ($summary) {
      $s = $summary[$p->ID] ?? ['total' => 0, 'visible' => 0, 'without_image' => 0];
      return [
        'id' => $p->ID,
        'title' => $p->post_title,
        'dmn_id' => (string)get_post_meta($p->ID, 'dmn_venue_id', true),
        'activities_count' => $s['total'],
        'visible_count' => $s['visible'],
        'without_image_count' => $s['without_image'],
        'hide_unavailable' => get_post_meta($p->ID, 'dmn_hide_unavailable', true) === '1',
      ];
    }, $posts);

    return new WP_REST_Response(['venues' => $venues], 200);
  }

  /**
   * Update a dmn_venue's widget settings.
   *
   * @param WP_REST_Request $r Request with route 'id' and JSON body.
   * @return WP_REST_Response 200 on success, 404 on missing post.
   */
  public function dmn_admin_save_venue(WP_REST_Request $r): WP_REST_Response
  {
    $id = (int)$r['id'];
    $p = get_post($id);
    if (!$p || $p->post_type !== 'dmn_venue') {
      return new WP_REST_Response(['message' => 'Venue not found. Reload the page and try again.'], 404);
    }

    // Read through the request so the 'boolean' arg schema applies; rest_sanitize_boolean
    // treats strings such as "false" and "0" as false, which a plain truthiness check would not.
    if ($r->has_param('hide_unavailable')) {
      $hide = rest_sanitize_boolean($r->get_param('hide_unavailable'));
      update_post_meta($id, 'dmn_hide_unavailable', $hide ? '1' : '0');
    }

    return new WP_REST_Response([
      'ok' => true,
      'hide_unavailable' => get_post_meta($id, 'dmn_hide_unavailable', true) === '1',
    ], 200);
  }

  /**
   * List dmn_activity posts under a venue.
   *
   * @param WP_REST_Request $r Request with route param 'venue'.
   * @return WP_REST_Response Response with 'activities'.
   */
  public function dmn_admin_list_activities(WP_REST_Request $r): WP_REST_Response
  {
    $venue_id = (int)$r['venue'];
    $posts = get_posts([
      'post_type' => 'dmn_activity',
      'post_parent' => $venue_id,
      'numberposts' => 1000,
    ]);

    $rows = array_map(function (WP_Post $p) {
      $img_id = (int)get_post_thumbnail_id($p->ID);
      return [
        'id' => $p->ID,
        'dmn_type_id' => (string)get_post_meta($p->ID, 'dmn_type_id', true),
        'name' => (string)(get_post_meta($p->ID, 'display_name', true) ?: $p->post_title),
        'description' => (string)get_post_meta($p->ID, 'short_description', true),
        'priceText' => (string)get_post_meta($p->ID, 'price_text', true),
        'image_id' => $img_id ?: null,
        'image_url' => $img_id ? wp_get_attachment_image_url($img_id, 'large') : null,
        'gallery_ids' => array_values(array_filter(array_map('intval', (array)get_post_meta($p->ID, 'gallery', true)))),
        'visible' => get_post_meta($p->ID, 'visible', true) !== '0',
        'duration_minutes' => (int)get_post_meta($p->ID, '_dmn_duration_minutes', true),
        'price_mode' => ($m = (string)get_post_meta($p->ID, 'dmn_price_mode', true))
        && in_array($m, ['per_person', 'per_room', 'display'], true) ? $m : 'per_person',
      ];

    }, $posts);

    return new WP_REST_Response(['activities' => $rows], 200);
  }

  /**
   * Update a dmn_activity.
   *
   * @param WP_REST_Request $r Request with route 'id' and JSON body.
   * @return WP_REST_Response 200 on success, 404 on missing post.
   */
  public function dmn_admin_save_activity(WP_REST_Request $r): WP_REST_Response
  {
    $id = (int)$r['id'];
    $p = get_post($id);
    if (!$p || $p->post_type !== 'dmn_activity') {
      return new WP_REST_Response(['message' => 'Not found'], 404);
    }

    $b = $r->get_json_params() ?: [];

    if (isset($b['name'])) {
      wp_update_post(['ID' => $id, 'post_title' => sanitize_text_field($b['name'])]);
      update_post_meta($id, 'display_name', sanitize_text_field($b['name']));
    }
    if (array_key_exists('description', $b)) {
      update_post_meta($id, 'short_description', wp_kses_post($b['description'] ?? ''));
    }
    if (array_key_exists('priceText', $b)) {
      update_post_meta($id, 'price_text', sanitize_text_field($b['priceText'] ?? ''));
    }
    if (array_key_exists('image_id', $b)) {
      $img_id = (int)$b['image_id'];
      if ($img_id > 0) set_post_thumbnail($id, $img_id);
      else delete_post_thumbnail($id);
    }
    if (array_key_exists('gallery_ids', $b)) {
      $ids = array_values(array_filter(array_map('intval', (array)$b['gallery_ids'])));
      update_post_meta($id, 'gallery', $ids);
    }
    if (array_key_exists('visible', $b)) {
      update_post_meta($id, 'visible', $b['visible'] ? '1' : '0');
    }

    if (array_key_exists('price_mode', $b)) {
      $mode = sanitize_text_field((string)($b['price_mode'] ?? ''));
      if (!in_array($mode, ['per_room', 'display'], true)) $mode = 'per_person';
      update_post_meta($id, 'dmn_price_mode', $mode);
    }


    return new WP_REST_Response(['ok' => true], 200);
  }

  /**
   * Sync venues from DMN.
   *
   * @return WP_REST_Response Summary with count.
   */
  public function dmn_admin_sync_venues(): WP_REST_Response
  {
    $count = $this->upsert_venues_from_dmn();
    return new WP_REST_Response([
      'ok' => true,
      'count' => $count,
      'message' => "Imported/updated $count venues.",
    ], 200);
  }

  /**
   * Upsert venues from /venues.
   *
   * @return int Number of upserts.
   */
  public function upsert_venues_from_dmn(): int
  {
    $client = new DmnClient();

    $q = [];
    $vg = Settings::get_vg();
    if ($vg) $q['venue_group'] = $vg;

    $resp = $client->request('GET', '/venues', $q);
    if (!$resp['ok']) {
      $this->import_error = self::describe_dmn_error($resp, 'The venue list could not be read from DesignMyNight');
      return 0;
    }

    $pages = (array)($resp['data']['payload']['pages'] ?? []);
    $count = 0;

    foreach ($pages as $v) {
      $extId = (string)($v['_id'] ?? '');
      if (!$extId) continue;

      $title = (string)($v['name'] ?? $v['title'] ?? $v['path'] ?? $extId);
      $path = (string)($v['path'] ?? '');

      $existing = get_posts([
        'post_type' => 'dmn_venue',
        'meta_key' => 'dmn_venue_id',
        'meta_value' => $extId,
        'numberposts' => 1,
        'fields' => 'ids',
      ]);

      if ($existing) {
        $pid = (int)$existing[0];
        wp_update_post(['ID' => $pid, 'post_title' => $title]);
      } else {
        $pid = wp_insert_post([
          'post_type' => 'dmn_venue',
          'post_status' => 'publish',
          'post_title' => $title,
        ]);
        if ($pid && !is_wp_error($pid)) {
          add_post_meta($pid, 'dmn_venue_id', $extId, true);
        }
      }

      if (!empty($pid) && !is_wp_error($pid)) {
        update_post_meta($pid, 'dmn_venue_path', $path);
        $count++;
      }
    }

    return $count;
  }

  /**
   * Sync activity types for all venues.
   *
   * @return WP_REST_Response Summary with count.
   */
  public function dmn_admin_sync_types_all(): WP_REST_Response
  {
    $count = $this->upsert_types_for_all_venues();
    return new WP_REST_Response([
      'ok' => true,
      'count' => $count,
      'message' => "Imported/updated $count activity types.",
    ], 200);
  }

  /**
   * Upsert activity types using booking-availability suggested values.
   *
   * @return int Number of upserts.
   */
  public function upsert_types_for_all_venues(): int
  {
    $client = new DmnClient();

    $venues = get_posts([
      'post_type' => 'dmn_venue',
      'numberposts' => 1000,
      'fields' => 'ids',
    ]);

    $total = 0;

    foreach ($venues as $venuePostId) {
      $venuePostId = (int)$venuePostId;

      $ext_id = (string)get_post_meta($venuePostId, 'dmn_venue_id', true);
      if ($ext_id === '') {
        continue;
      }

      // Minimal payload to get suggested booking types.
      $availabilityPayload = [
        'num_people' => 2,
        'date' => gmdate('Y-m-d'),
      ];

      $resp = $client->request(
        'POST',
        "/venues/$ext_id/booking-availability",
        ['fields' => 'type'],
        $availabilityPayload
      );

      if (empty($resp['ok'])) {
        $this->import_issues[] = self::describe_dmn_error(
          $resp,
          sprintf('Activities for %s could not be read', get_the_title($venuePostId) ?: "venue $ext_id")
        );
        continue;
      }

      $data = $resp['data'] ?? [];
      $validation = $data['payload']['validation'] ?? null;
      $suggested = $validation['type']['suggestedValues'] ?? [];
      if (!is_array($suggested)) {
        $suggested = [];
      }

      foreach ($suggested as $item) {
        $v = (is_array($item) && array_key_exists('value', $item)) ? $item['value'] : $item;

        $typeId = is_array($v) ? (string)($v['id'] ?? '') : (string)$v;
        $typeName = is_array($v) ? (string)($v['name'] ?? $typeId) : $typeId;

        if ($typeId === '') {
          continue;
        }

        $pid = 0;

        $existing = get_posts([
          'post_type' => 'dmn_activity',
          'post_parent' => $venuePostId,
          'meta_key' => 'dmn_type_id',
          'meta_value' => $typeId,
          'numberposts' => 1,
          'fields' => 'ids',
        ]);

        if (!empty($existing)) {
          $pid = (int)$existing[0];

          wp_update_post([
            'ID' => $pid,
            'post_title' => $typeName,
          ]);
        } else {
          $inserted = wp_insert_post([
            'post_type' => 'dmn_activity',
            'post_status' => 'publish',
            'post_title' => $typeName,
            'post_parent' => $venuePostId,
          ]);

          if ($inserted && !is_wp_error($inserted)) {
            $pid = (int)$inserted;
            add_post_meta($pid, 'dmn_type_id', $typeId, true);
          }
        }

        if (empty($pid) || is_wp_error($pid)) {
          continue;
        }


        if ((string)get_post_meta($pid, 'dmn_type_id', true) !== $typeId) {
          update_post_meta($pid, 'dmn_type_id', $typeId);
        }

        $priceMode = (string)get_post_meta($pid, 'dmn_price_mode', true);
        if (!in_array($priceMode, ['per_person', 'per_room', 'display'], true)) {
          update_post_meta($pid, 'dmn_price_mode', 'per_person');
        }

      
        try {
          $rulesPayload = [
            'type' => $typeId,
            'date' => gmdate('Y-m-d'),
            'num_people' => 2,
          ];

          // NOTE: booking-rules expects payload as the POST body.
          $rules = $client->request('POST', "/venues/$ext_id/booking-rules", [], $rulesPayload);

          if (!empty($rules['ok'])) {
            $payload = $rules['data']['payload'] ?? [];
            $minutes = null;

            if (isset($payload['max_duration'])) {
              $minutes = (int)$payload['max_duration'];
            } elseif (!empty($payload['max_booking_duration'])) {
              try {
                $d = new DateInterval((string)$payload['max_booking_duration']);
                $minutes = ($d->h * 60) + $d->i;
              } catch (Exception $e) {
                // ignore
              }
            }

            if ($minutes !== null) {
              update_post_meta($pid, '_dmn_duration_minutes', $minutes);
            }
          }
        } catch (Throwable $e) {
          error_log("[DMN] Duration fetch failed for type $typeId: " . $e->getMessage());
        }

        $total++;
      }
    }

    return $total;
  }


  /**
   * Sync venues and activity types.
   *
   * @return WP_REST_Response Summary with counts and duration.
   */
  public function dmn_admin_sync_all(): WP_REST_Response
  {
    $t0 = microtime(true);
    $this->import_issues = [];
    $this->import_error = null;

    if (Settings::get_app_id() === '' || Settings::get_api_key() === '') {
      $this->import_error = 'Add your App ID and API key under Connection before importing.';
      $venues_count = 0;
      $types_count = 0;
    } else {
      $venues_count = $this->upsert_venues_from_dmn();
      // If the venue list failed (bad credentials, rate limit…), per-venue requests would fail the
      // same way and only use up more of the hourly limit.
      $types_count = $this->import_error === null ? $this->upsert_types_for_all_venues() : 0;
    }

    $ms = (int)round((microtime(true) - $t0) * 1000);
    $ok = $this->import_error === null;
    $previous = get_option(self::OPT_LAST_IMPORT, null);
    $previous_success = is_array($previous) ? ($previous['last_success_at'] ?? null) : null;
    $previous_data_env = is_array($previous)
      ? ($previous['data_environment'] ?? (!empty($previous['ok']) ? ($previous['environment'] ?? null) : null))
      : null;

    $record = [
      'finished_at' => time(),
      // Kept across failed imports, so the dashboard can say how old the imported data is.
      'last_success_at' => $ok ? time() : $previous_success,
      'ok' => $ok,
      // The environment this attempt used, and the one the stored venues came from.
      'environment' => Settings::get_env(),
      'data_environment' => $ok ? Settings::get_env() : $previous_data_env,
      'venues_count' => $venues_count,
      'types_count' => $types_count,
      'duration_ms' => $ms,
      'error' => $this->import_error,
      'issues' => array_slice($this->import_issues, 0, 20),
      'issues_count' => count($this->import_issues),
    ];
    update_option(self::OPT_LAST_IMPORT, $record, false);

    if (!$ok) {
      // A non-2xx status so the admin app shows it as a failure.
      return new WP_REST_Response(['code' => 'dmn_import_failed', 'message' => $this->import_error] + $record, 502);
    }

    $message = sprintf(
      'Imported %d %s and %d %s.',
      $venues_count,
      $venues_count === 1 ? 'venue' : 'venues',
      $types_count,
      $types_count === 1 ? 'activity' : 'activities'
    );
    if ($this->import_issues) {
      $message .= sprintf(
        ' %d %s: see the Dashboard for details.',
        count($this->import_issues),
        count($this->import_issues) === 1 ? 'problem' : 'problems'
      );
    }

    return new WP_REST_Response(['message' => $message] + $record, 200);
  }

  /**
   * Summary for the admin dashboard: the last import and the connection settings. Makes no DMN request.
   *
   * @return WP_REST_Response
   */
  public function dmn_admin_overview(): WP_REST_Response
  {
    $last = get_option(self::OPT_LAST_IMPORT, null);

    return new WP_REST_Response([
      'last_import' => is_array($last) ? $last : null,
      'connection' => [
        'has_credentials' => Settings::get_app_id() !== '' && Settings::get_api_key() !== '',
        'environment' => Settings::get_env(),
        'venue_group' => Settings::get_vg(),
      ],
    ], 200);
  }

  /**
   * Turn a failed DmnClient response into a message that says what to do, using the error codes in
   * https://developers.designmynight.com/api/api-basics/.
   */
  private static function describe_dmn_error(array $resp, string $context): string
  {
    $status = (int)($resp['status'] ?? 0);
    if ($status === 0) {
      $hint = 'DesignMyNight could not be reached. Check the site can make outgoing requests, then try again.';
    } elseif ($status === 401 || $status === 403) {
      $hint = 'DesignMyNight rejected the API credentials. Check the App ID, API key and environment under Connection.';
    } elseif ($status === 404) {
      $hint = 'DesignMyNight could not find it. Check the venue group and environment under Connection.';
    } elseif ($status === 429) {
      $hint = 'The hourly DesignMyNight request limit was reached. Try again later.';
    } elseif ($status === 503) {
      $hint = 'DesignMyNight is temporarily unavailable. Try again later.';
    } else {
      $hint = 'DesignMyNight returned an error.';
    }
    $detail = trim((string)($resp['error'] ?? ''));

    return sprintf('%s (%s). %s', $context, $status ? "HTTP $status" : 'no response', $hint)
      . ($detail !== '' ? " DesignMyNight said: $detail" : '');
  }
}
