<?php

namespace DMN\Booking\Rest;

use DMN\Booking\Config\Settings;
use DMN\Booking\Services\DmnClient;
use WP_Error;
use WP_Post;
use WP_REST_Request;
use WP_REST_Response;

class AdminController
{
  public function register_routes(): void
  {
    // --- Settings (existing) ---
    register_rest_route('dmn/v1/admin', '/settings', [
      'methods' => 'GET',
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
      }
    ]);

    // POST /dmn/v1/admin/settings (existing)
    register_rest_route('dmn/v1/admin', '/settings', [
      'methods' => 'POST',
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => function (WP_REST_Request $req) {
        Settings::set((array)($req->get_json_params() ?? []));
        return new WP_REST_Response([
          'ok' => true,
          'environment' => Settings::get_env(),
          'debug_mode' => Settings::get_debug(),
          'venue_group' => Settings::get_vg(),
        ], 200);
      }
    ]);

    // GET /dmn/v1/admin/test (existing)
    register_rest_route('dmn/v1/admin', '/test', [
      'methods' => 'GET',
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'test_connection'],
    ]);

    // --- Admin data & editing routes ---
    // GET /wp-json/dmn/v1/admin/venues
    register_rest_route('dmn/v1/admin', '/venues', [
      'methods' => 'GET',
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_list_venues'],
    ]);

    // POST /wp-json/dmn/v1/admin/sync/venues
    register_rest_route('dmn/v1/admin', '/sync/venues', [
      'methods' => 'POST',
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_sync_venues'],
    ]);

    // POST /wp-json/dmn/v1/admin/sync/types
    register_rest_route('dmn/v1/admin', '/sync/types', [
      'methods' => 'POST',
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_sync_types_all'],
    ]);

    // GET /wp-json/dmn/v1/admin/venues/{venue}/activities
    register_rest_route('dmn/v1/admin', '/venues/(?P<venue>\d+)/activities', [
      'methods' => 'GET',
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_list_activities'],
      'args' => ['venue' => ['type' => 'integer', 'required' => true]],
    ]);

    // POST /wp-json/dmn/v1/admin/activities/{id}
    register_rest_route('dmn/v1/admin', '/activities/(?P<id>\d+)', [
      'methods' => 'POST',
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_save_activity'],
      'args' => ['id' => ['type' => 'integer', 'required' => true]],
    ]);

    // POST /wp-json/dmn/v1/admin/sync/all
    register_rest_route('dmn/v1/admin', '/sync/all', [
      'methods' => 'POST',
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_sync_all'],
    ]);

    // GET /wp-json/dmn/v1/admin/packages?venue_id=XXX&search=foo
    register_rest_route('dmn/v1/admin', '/packages', [
      'methods' => 'GET',
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_list_packages'],
      'args' => [
        'venue_id' => ['type' => 'string', 'required' => false],
        'search' => ['type' => 'string', 'required' => false],
      ],
    ]);

    // POST /wp-json/dmn/v1/admin/packages  (bulk upsert)
    register_rest_route('dmn/v1/admin', '/packages', [
      'methods' => 'POST',
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_packages_bulk_save'],
    ]);

    // DELETE /wp-json/dmn/v1/admin/packages/{id}
    register_rest_route('dmn/v1/admin', '/packages/(?P<id>\d+)', [
      'methods' => 'DELETE',
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_delete_package'],
      'args' => ['id' => ['type' => 'integer', 'required' => true]],
    ]);


  }

  // -------------------------
  // Existing method (unchanged)
  // -------------------------
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
    $r = $client->request('GET', '/venues', $q, null);
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

  // -------------------------
  // List venues for admin UI
  // -------------------------
  public function dmn_admin_list_venues(WP_REST_Request $r): WP_REST_Response
  {
    $posts = get_posts([
      'post_type' => 'dmn_venue',
      'numberposts' => -1,
      'orderby' => 'title',
      'order' => 'ASC',
    ]);

    $venues = array_map(function (WP_Post $p) {
      return [
        'id' => (int)$p->ID,
        'title' => $p->post_title,
        'dmn_id' => (string)get_post_meta($p->ID, 'dmn_venue_id', true),
      ];
    }, $posts);

    return new WP_REST_Response(['venues' => $venues], 200);
  }

  // -------------------------
  // List activities for a venue (admin UI)
  // -------------------------
  public function dmn_admin_list_activities(WP_REST_Request $r): WP_REST_Response
  {
    $venue_id = (int)$r['venue'];
    $posts = get_posts([
      'post_type' => 'dmn_activity',
      'post_parent' => $venue_id,
      'numberposts' => -1,
      'orderby' => 'menu_order title',
      'order' => 'ASC',
    ]);

    $rows = array_map(function (WP_Post $p) {
      $img_id = (int)get_post_thumbnail_id($p->ID);
      return [
        'id' => (int)$p->ID,
        'dmn_type_id' => (string)get_post_meta($p->ID, 'dmn_type_id', true),
        'name' => (string)(get_post_meta($p->ID, 'display_name', true) ?: $p->post_title),
        'description' => (string)get_post_meta($p->ID, 'short_description', true),
        'priceText' => (string)get_post_meta($p->ID, 'price_text', true),
        'image_id' => $img_id ?: null,
        'image_url' => $img_id ? wp_get_attachment_image_url($img_id, 'large') : null,
        'gallery_ids' => array_values(array_filter(array_map('intval', (array)get_post_meta($p->ID, 'gallery', true)))),
      ];
    }, $posts);

    return new WP_REST_Response(['activities' => $rows], 200);
  }

  // -------------------------
  // Save activity (admin UI)
  // -------------------------
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
      if ($img_id > 0) {
        set_post_thumbnail($id, $img_id);
      } else {
        delete_post_thumbnail($id);
      }
    }
    if (array_key_exists('gallery_ids', $b)) {
      $ids = array_values(array_filter(array_map('intval', (array)$b['gallery_ids'])));
      update_post_meta($id, 'gallery', $ids);
    }

    return new WP_REST_Response(['ok' => true], 200);
  }

  /* ------------------------------------------------------------------ */
  /*  WRAPPER ENDPOINTS (share helpers)                                  */
  /* ------------------------------------------------------------------ */

  // POST /dmn/v1/admin/sync/venues  → calls helper
  public function dmn_admin_sync_venues(WP_REST_Request $r): WP_REST_Response
  {
    $count = $this->upsert_venues_from_dmn();
    return new WP_REST_Response([
      'ok' => true,
      'count' => (int)$count,
      'message' => "Imported/updated {$count} venues.",
    ], 200);
  }

  // POST /dmn/v1/admin/sync/types  → calls helper

  /**
   * Fetch venues from DMN and upsert local dmn_venue posts.
   * @return int number of venues upserted/updated
   */
  private function upsert_venues_from_dmn(): int
  {
    $client = new DmnClient();

    $q = [];
    $vg = Settings::get_vg();
    if ($vg) $q['venue_group'] = $vg;

    $resp = $client->request('GET', '/venues', $q, null);
    if (!$resp['ok']) {
      // Optionally log $resp here
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

  // POST /dmn/v1/admin/sync/all  → venues + types

  public function dmn_admin_sync_types_all(WP_REST_Request $r): WP_REST_Response
  {
    $count = $this->upsert_types_for_all_venues();
    return new WP_REST_Response([
      'ok' => true,
      'count' => (int)$count,
      'message' => "Imported/updated {$count} activity types.",
    ], 200);
  }

  /* ------------------------------------------------------------------ */
  /*  PRIVATE HELPERS (shared logic)                                     */
  /* ------------------------------------------------------------------ */

  /**
   * For every local dmn_venue, fetch suggested booking types from DMN and upsert dmn_activity children.
   * Uses the venue-scoped booking-availability with fields=type (recommended).
   * @return int number of activity posts created/updated
   */
  private function upsert_types_for_all_venues(): int
  {
    $client = new DmnClient();

    $venues = get_posts([
      'post_type' => 'dmn_venue',
      'numberposts' => -1,
      'fields' => 'ids',
    ]);

    $total = 0;

    foreach ($venues as $venuePostId) {
      $venuePostId = (int)$venuePostId;
      $ext_id = (string)get_post_meta($venuePostId, 'dmn_venue_id', true);
      if (!$ext_id) continue;

      $payload = [
        'num_people' => 2,
        'date' => gmdate('Y-m-d'),
      ];

      $resp = $client->request(
        'POST',
        "/venues/{$ext_id}/booking-availability",
        ['fields' => 'type'],
        $payload
      );
      if (!$resp['ok']) continue;

      $data = $resp['data'] ?? [];
      $validation = $data['payload']['validation'] ?? null;
      $suggested = $validation['type']['suggestedValues'] ?? [];
      if (!is_array($suggested)) $suggested = [];

      foreach ($suggested as $item) {
        // supports { value: {id,name} } or {id,name} or "id"
        $v = (is_array($item) && isset($item['value'])) ? $item['value'] : $item;
        $typeId = is_array($v) ? (string)($v['id'] ?? '') : (string)$v;
        $typeName = is_array($v) ? (string)($v['name'] ?? $typeId) : $typeId;
        if (!$typeId) continue;

        $existing = get_posts([
          'post_type' => 'dmn_activity',
          'post_parent' => $venuePostId,
          'meta_key' => 'dmn_type_id',
          'meta_value' => $typeId,
          'numberposts' => 1,
          'fields' => 'ids',
        ]);

        if ($existing) {
          $pid = (int)$existing[0];
          wp_update_post(['ID' => $pid, 'post_title' => $typeName]);
        } else {
          $pid = wp_insert_post([
            'post_type' => 'dmn_activity',
            'post_status' => 'publish',
            'post_title' => $typeName,
            'post_parent' => $venuePostId,
          ]);
          if ($pid && !is_wp_error($pid)) {
            add_post_meta($pid, 'dmn_type_id', $typeId, true);
          }
        }

        if (!empty($pid) && !is_wp_error($pid)) {
          $total++;
        }
      }
    }

    return $total;
  }

  public function dmn_admin_sync_all(WP_REST_Request $r): WP_REST_Response
  {
    $t0 = microtime(true);
    $venues_count = $this->upsert_venues_from_dmn();
    $types_count = $this->upsert_types_for_all_venues();
    $ms = (int)round((microtime(true) - $t0) * 1000);

    return new WP_REST_Response([
      'ok' => true,
      'venues_count' => (int)$venues_count,
      'types_count' => (int)$types_count,
      'duration_ms' => $ms,
      'message' => "Imported/updated {$venues_count} venues and {$types_count} activity types.",
    ], 200);
  }

  /* -------------------------
 * Admin Packages — List
 * ------------------------- */
  public function dmn_admin_list_packages(WP_REST_Request $r): WP_REST_Response
  {
    $venueId = (string)($r->get_param('venue_id') ?? '');
    $search = (string)($r->get_param('search') ?? '');

    $args = [
      'post_type' => 'dmn_package',
      'post_status' => ['publish', 'draft'],
      's' => $search ?: '',
      'posts_per_page' => 200,
      'no_found_rows' => true,
      'orderby' => 'date',
      'order' => 'DESC',
    ];

    if ($venueId !== '') {
      $args['meta_query'] = [
        [
          'key' => '_dmn_pkg_venue_ids',
          'value' => '"' . $venueId . '"', // match serialized array containing venueId
          'compare' => 'LIKE',
        ],
      ];
    }

    $posts = get_posts($args);
    $out = array_map([$this, 'dmn_format_package_admin'], $posts);

    return new WP_REST_Response(['packages' => $out], 200);
  }

  /* -------------------------
   * Admin Packages — Bulk Save
   * Body: { packages: [ {id?, name, description?, priceText?, visible?, image_id?, venueIds?: string[]} ] }
   * ------------------------- */
  public function dmn_admin_packages_bulk_save(WP_REST_Request $r): WP_REST_Response
  {
    $body = $r->get_json_params();
    $items = is_array($body['packages'] ?? null) ? $body['packages'] : [];

    $updated = [];

    foreach ($items as $it) {
      $id = isset($it['id']) ? (int)$it['id'] : 0;
      $name = sanitize_text_field($it['name'] ?? '');
      $desc = wp_kses_post($it['description'] ?? '');
      $priceText = sanitize_text_field($it['priceText'] ?? '');
      $visible = !empty($it['visible']);
      $imageId = isset($it['image_id']) ? (int)$it['image_id'] : 0;
      $venueIds = array_values(array_filter(array_map('sanitize_text_field', (array)($it['venueIds'] ?? []))));

      $postarr = [
        'ID' => $id,
        'post_type' => 'dmn_package',
        'post_title' => $name ?: __('Untitled', 'dmn'),
        'post_content' => $desc,
        'post_status' => $visible ? 'publish' : 'draft',
      ];

      if ($id) {
        $id = wp_update_post($postarr, true);
      } else {
        $id = wp_insert_post($postarr, true);
      }

      if (is_wp_error($id)) {
        return new WP_REST_Response(['error' => $id->get_error_message()], 400);
      }

      update_post_meta($id, '_dmn_pkg_price_text', $priceText);
      update_post_meta($id, '_dmn_pkg_visible', (bool)$visible);
      
      $venueIds = [];
      foreach ((array)($it['venueIds'] ?? []) as $vid) {
        $vid = sanitize_text_field($vid);
        if (ctype_digit($vid)) {
          $dmnId = (string)get_post_meta((int)$vid, 'dmn_venue_id', true);
          $venueIds[] = $dmnId ?: $vid;
        } else {
          $venueIds[] = $vid;
        }
      }
      update_post_meta($id, '_dmn_pkg_venue_ids', $venueIds);

      if ($imageId > 0) {
        set_post_thumbnail($id, $imageId);
      }

      $updated[] = $this->dmn_format_package_admin(get_post($id));
    }

    return new WP_REST_Response(['packages' => $updated], 200);
  }

  /* -------------------------
   * Admin Packages — Delete
   * ------------------------- */

  private function dmn_format_package_admin(WP_Post $p): array
  {
    $price = (string)get_post_meta($p->ID, '_dmn_pkg_price_text', true);
    $visible = (bool)get_post_meta($p->ID, '_dmn_pkg_visible', true);
    $venueIds = (array)get_post_meta($p->ID, '_dmn_pkg_venue_ids', true);
    $imgId = (int)get_post_thumbnail_id($p->ID);
    $imgUrl = $imgId ? wp_get_attachment_image_url($imgId, 'large') : null;

    return [
      'id' => (int)$p->ID,
      'name' => (string)get_the_title($p),
      'description' => (string)$p->post_content,
      'image_id' => $imgId ?: null,
      'image_url' => $imgUrl,
      'priceText' => $price ?: null,
      'visible' => $p->post_status === 'publish' ? (bool)$visible : false,
      'venueIds' => array_values(array_map('strval', $venueIds)),
    ];
  }

  /* -------------------------
   * Helper: normalize a package row for admin UI
   * ------------------------- */

  public function dmn_admin_delete_package(WP_REST_Request $r): WP_REST_Response
  {
    $id = (int)$r['id'];
    if ($id <= 0) {
      return new WP_REST_Response(['error' => 'Invalid ID'], 400);
    }
    $p = get_post($id);
    if (!$p || $p->post_type !== 'dmn_package') {
      return new WP_REST_Response(['error' => 'Not found'], 404);
    }
    wp_delete_post($id, true);
    return new WP_REST_Response(['deleted' => $id], 200);
  }
}
