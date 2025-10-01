<?php

namespace DMN\Booking\Rest;

use DMN\Booking\Config\Settings;
use DMN\Booking\Services\DmnClient;
use Throwable;
use WP_Error;
use WP_Post;
use WP_Query;
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


  /**
   * Register admin REST routes.
   *
   * Notes
   * - Keeps existing route shapes and permissions.
   * - FAQ callbacks switched to standalone functions for consistency.
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

    // Sync all
    register_rest_route('dmn/v1/admin', '/sync/all', [
      'methods' => WP_REST_Server::CREATABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_sync_all'],
    ]);

    // Menus: list
    register_rest_route('dmn/v1/admin', '/menus', [
      'methods' => WP_REST_Server::READABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_list_menus'],
    ]);

    // Menu items: list by venue (grouped)
    register_rest_route('dmn/v1/admin', '/menu-items', [
      'methods' => WP_REST_Server::READABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_list_menu_items'],
      'args' => ['venue' => ['type' => 'integer', 'required' => true]],
    ]);

    // Menu item: update
    register_rest_route('dmn/v1/admin', '/menu-items/(?P<id>\d+)', [
      'methods' => WP_REST_Server::CREATABLE,
      'permission_callback' => fn() => current_user_can('manage_options'),
      'callback' => [$this, 'dmn_admin_save_menu_item'],
      'args' => ['id' => ['type' => 'integer', 'required' => true]],
    ]);

    // FAQs (already using constants)
    register_rest_route('dmn/v1', '/admin/faqs', [
      [
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => fn() => current_user_can('manage_options'),
        'callback' => [$this, 'dmn_admin_faqs_get'],
        'args' => [
          'venue_id' => ['required' => true, 'type' => 'integer'],
        ],
      ],
      [
        'methods' => WP_REST_Server::CREATABLE,
        'permission_callback' => fn() => current_user_can('manage_options'),
        'callback' => [$this, 'dmn_admin_faqs_save'],
        'args' => [
          'venue_id' => ['required' => true, 'type' => 'integer'],
          'faqs' => ['required' => true, 'type' => 'array'],
        ],
      ],
    ]);

    // AdminController.php — inside register_routes()
    register_rest_route('dmn/v1', '/admin/large-group-link', [
      [
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => fn() => current_user_can('manage_options'),
        'callback' => [$this, 'dmn_admin_large_group_link_get'],
        'args' => [
          'venue_id' => ['required' => true, 'type' => 'integer'],
        ],
      ],
      [
        'methods' => WP_REST_Server::CREATABLE,
        'permission_callback' => fn() => current_user_can('manage_options'),
        'callback' => [$this, 'dmn_admin_large_group_link_save'],
        'args' => [
          'venue_id' => ['required' => true, 'type' => 'integer'],
          'url' => ['required' => true, 'type' => 'string'], // blank hides link
          'label' => ['required' => false, 'type' => 'string'],
          'minSize' => ['required' => false, 'type' => 'integer'],
        ],
      ],
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
   * List dmn_venue posts.
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

    $venues = array_map(function (WP_Post $p) {
      return [
        'id' => $p->ID,
        'title' => $p->post_title,
        'dmn_id' => (string)get_post_meta($p->ID, 'dmn_venue_id', true),
      ];
    }, $posts);

    return new WP_REST_Response(['venues' => $venues], 200);
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
      'numberposts' => -1,
      'orderby' => 'menu_order title',
      'order' => 'ASC',
    ]);

    $rows = array_map(function (WP_Post $p) {
      $img_id = (int)get_post_thumbnail_id($p->ID);
      $menu_post_id = (int)get_post_meta($p->ID, 'dmn_menu_post_id', true);
      return [
        'id' => $p->ID,
        'dmn_type_id' => (string)get_post_meta($p->ID, 'dmn_type_id', true),
        'name' => (string)(get_post_meta($p->ID, 'display_name', true) ?: $p->post_title),
        'description' => (string)get_post_meta($p->ID, 'short_description', true),
        'priceText' => (string)get_post_meta($p->ID, 'price_text', true),
        'image_id' => $img_id ?: null,
        'image_url' => $img_id ? wp_get_attachment_image_url($img_id, 'large') : null,
        'gallery_ids' => array_values(array_filter(array_map('intval', (array)get_post_meta($p->ID, 'gallery', true)))),
        'menu_post_id' => $menu_post_id > 0 ? $menu_post_id : null,
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
    if (array_key_exists('menu_post_id', $b)) {
      $menu_id = (int)$b['menu_post_id'];
      if ($menu_id > 0) update_post_meta($id, 'dmn_menu_post_id', $menu_id);
      else delete_post_meta($id, 'dmn_menu_post_id');
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
      if (!$ext_id) continue;

      $payload = [
        'num_people' => 2,
        'date' => gmdate('Y-m-d'),
      ];

      $resp = $client->request(
        'POST',
        "/venues/$ext_id/booking-availability",
        ['fields' => 'type'],
        $payload
      );
      if (!$resp['ok']) continue;

      $data = $resp['data'] ?? [];
      $validation = $data['payload']['validation'] ?? null;
      $suggested = $validation['type']['suggestedValues'] ?? [];
      if (!is_array($suggested)) $suggested = [];

      foreach ($suggested as $item) {
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

  /**
   * Sync venues, types, menus, and items.
   *
   * @return WP_REST_Response Summary with counts and duration.
   */
  public function dmn_admin_sync_all(): WP_REST_Response
  {
    $t0 = microtime(true);

    $venues_count = $this->upsert_venues_from_dmn();
    $types_count = $this->upsert_types_for_all_venues();

    $menus_count = 0;
    $menu_items_count = 0;
    $vg = Settings::get_vg();
    if ($vg) {
      try {
        $client = new DmnClient();
        $m = $this->import_preorder_menus($client, $vg);
        $menus_count = (int)($m['menus_count'] ?? 0);
        $menu_items_count = (int)($m['items_count'] ?? 0);
      } catch (Throwable) {
        // optional: log error
      }
    }

    $ms = (int)round((microtime(true) - $t0) * 1000);

    return new WP_REST_Response([
      'ok' => true,
      'venues_count' => $venues_count,
      'types_count' => $types_count,
      'menus_count' => $menus_count,
      'menu_items_count' => $menu_items_count,
      'duration_ms' => $ms,
      'message' => sprintf(
        'Imported/updated %d venues, %d activity types, %d menus and %d menu items.',
        $venues_count,
        $types_count,
        $menus_count,
        $menu_items_count
      ),
    ], 200);
  }

  /**
   * Import preorder menus and items for a venue group.
   *
   * @param DmnClient $client DMN client.
   * @param string $venue_group_id Venue group ID.
   * @return array {menus_count:int, items_count:int}
   */
  public function import_preorder_menus(DmnClient $client, string $venue_group_id): array
  {
    $menus_count = 0;
    $items_count = 0;

    $resp = $client->request('GET', "/venue-groups/$venue_group_id", ['fields' => 'preorder_menus']);
    if (!($resp['ok'] ?? false)) return compact('menus_count', 'items_count');

    $menus = $resp['data']['payload']['venueGroup']['preorder_menus'] ?? [];
    if (!$menus || !is_array($menus)) return compact('menus_count', 'items_count');

    $pkgIndex = $this->build_runtime_package_index($client); // id => details

    foreach ($menus as $m) {
      $menu_post_id = $this->upsert_menu($m);
      if (!$menu_post_id) continue;
      $menus_count++;

      $items = $m['items'] ?? [];
      if (!is_array($items)) continue;

      foreach ($items as $it) {
        $dmn_item_id = (string)($it['id'] ?? '');
        if ($dmn_item_id === '') continue;

        $pkg = $pkgIndex[$dmn_item_id] ?? null;

        $name = $pkg['name'] ?? (string)($it['name'] ?? 'Item');
        $desc = $pkg['description'] ?? '';
        $price = isset($pkg['price']) ? (float)$pkg['price'] : (float)($it['price'] ?? 0);
        $type = $pkg['type'] ?? (string)($it['type'] ?? '');

        $this->upsert_menu_item([
          'dmn_item_id' => $dmn_item_id,
          'menu_post_id' => $menu_post_id,
          'pkg_post_id' => 0,
          'name' => $name,
          'desc' => $desc,
          'price' => $price,
          'type' => $type,
        ]);
        $items_count++;
      }
    }

    return compact('menus_count', 'items_count');
  }

  /**
   * Build an in-memory package index from DMN across local venues.
   *
   * @param DmnClient $client DMN client.
   * @return array Map id => {name,description,price,type}
   */
  public function build_runtime_package_index(DmnClient $client): array
  {
    $index = [];

    $venues = get_posts([
      'post_type' => 'dmn_venue',
      'numberposts' => 1000,
      'fields' => 'ids',
    ]);

    foreach ($venues as $venuePostId) {
      $venuePostId = (int)$venuePostId;
      $dmnVenueId = (string)get_post_meta($venuePostId, 'dmn_venue_id', true);
      if ($dmnVenueId === '') continue;

      $resp = $client->request('GET', "/venues/$dmnVenueId", ['fields' => 'packages']);
      if (!($resp['ok'] ?? false)) continue;

      $packages = $resp['data']['payload']['venue']['packages'] ?? [];
      if (!is_array($packages)) continue;

      foreach ($packages as $p) {
        $id = (string)($p['id'] ?? '');
        if ($id === '') continue;
        $index[$id] = [
          'name' => (string)($p['name'] ?? 'Package'),
          'description' => (string)($p['description'] ?? ''),
          'price' => (float)($p['price'] ?? 0),
          'type' => (string)($p['type'] ?? ''),
        ];
      }
    }

    return $index;
  }

  /**
   * Upsert a dmn_menu post.
   *
   * @param array $m Menu payload with 'id','name','description','fixed_price'.
   * @return int Post ID or 0.
   */
  public function upsert_menu(array $m): int
  {
    $dmn_menu_id = (string)($m['id'] ?? '');
    if (!$dmn_menu_id) return 0;

    $existing = new WP_Query([
      'post_type' => 'dmn_menu',
      'posts_per_page' => 1,
      'no_found_rows' => true,
      'fields' => 'ids',
      'meta_key' => '_dmn_menu_id',
      'meta_value' => $dmn_menu_id,
    ]);

    if ($existing->have_posts()) {
      $post_id = (int)$existing->posts[0];
      wp_update_post([
        'ID' => $post_id,
        'post_title' => wp_strip_all_tags($m['name'] ?? 'Untitled Menu'),
        'post_content' => (string)($m['description'] ?? ''),
      ]);
    } else {
      $post_id = wp_insert_post([
        'post_type' => 'dmn_menu',
        'post_status' => 'publish',
        'post_title' => wp_strip_all_tags($m['name'] ?? 'Untitled Menu'),
        'post_content' => (string)($m['description'] ?? ''),
      ]);
      if ($post_id) {
        add_post_meta($post_id, '_dmn_menu_id', $dmn_menu_id, true);
      }
    }

    if (!empty($post_id)) {
      update_post_meta($post_id, '_dmn_menu_fixed_price', !empty($m['fixed_price']));
      update_post_meta($post_id, '_dmn_menu_description', (string)($m['description'] ?? ''));
    }

    return (int)$post_id;
  }

  /**
   * Upsert a dmn_menu_item post.
   *
   * @param array $args {dmn_item_id,menu_post_id,pkg_post_id,name,desc,price,type}
   * @return void
   */
  public function upsert_menu_item(array $args): void
  {
    $dmn_item_id = (string)($args['dmn_item_id'] ?? '');
    $menu_post_id = (int)($args['menu_post_id'] ?? 0);
    if ($dmn_item_id === '' || !$menu_post_id) {
      return;
    }

    $existing = new WP_Query([
      'post_type' => 'dmn_menu_item',
      'posts_per_page' => 1,
      'no_found_rows' => true,
      'fields' => 'ids',
      'meta_query' => [
        ['key' => '_dmn_menu_post_id', 'value' => $menu_post_id, 'compare' => '='],
        ['key' => '_dmn_item_id', 'value' => $dmn_item_id, 'compare' => '='],
      ],
    ]);

    $title = wp_strip_all_tags((string)($args['name'] ?? 'Menu Item'));

    if ($existing->have_posts()) {
      $post_id = (int)$existing->posts[0];
      wp_update_post(['ID' => $post_id, 'post_title' => $title]);
    } else {
      $post_id = wp_insert_post([
        'post_type' => 'dmn_menu_item',
        'post_status' => 'publish',
        'post_title' => $title,
      ]);
      if ($post_id) {
        add_post_meta($post_id, '_dmn_item_id', $dmn_item_id, true);
        add_post_meta($post_id, '_dmn_menu_post_id', $menu_post_id, true);
      }
    }

    if (!empty($post_id)) {
      update_post_meta($post_id, '_dmn_package_post_id', (int)($args['pkg_post_id'] ?? 0));
      update_post_meta($post_id, '_dmn_item_type', (string)($args['type'] ?? ''));
      update_post_meta($post_id, '_dmn_item_name_ro', (string)($args['name'] ?? ''));
      update_post_meta($post_id, '_dmn_item_description_ro', (string)($args['desc'] ?? ''));
      update_post_meta($post_id, '_dmn_item_price_ro', (float)($args['price'] ?? 0));
    }
  }

  /**
   * List dmn_menu posts.
   *
   * @return WP_REST_Response Response with 'menus'.
   */
  public function dmn_admin_list_menus(): WP_REST_Response
  {
    $posts = get_posts([
      'post_type' => 'dmn_menu',
      'numberposts' => 1000,
      'orderby' => 'title',
      'order' => 'ASC',
      'fields' => 'all',
    ]);

    $menus = array_map(function (WP_Post $p) {
      return [
        'id' => $p->ID,
        'title' => $p->post_title,
        'fixed_price' => (bool)get_post_meta($p->ID, '_dmn_menu_fixed_price', true),
      ];
    }, $posts);

    return new WP_REST_Response(['menus' => $menus], 200);
  }

  /**
   * List menu items grouped by menu for activities under a venue.
   *
   * @param WP_REST_Request $r Request with query param 'venue'.
   * @return WP_REST_Response Response with 'menus' groups.
   */
  public function dmn_admin_list_menu_items(WP_REST_Request $r): WP_REST_Response
  {
    $venue_id = (int)$r->get_param('venue');
    if ($venue_id <= 0) {
      return new WP_REST_Response(['menus' => []], 200);
    }

    // Activities with assigned menu
    $activities = get_posts([
      'post_type' => 'dmn_activity',
      'post_parent' => $venue_id,
      'numberposts' => 100,
      'fields' => 'all',
      'orderby' => 'menu_order title',
      'order' => 'ASC',
      'meta_query' => [
        ['key' => 'dmn_menu_post_id', 'compare' => 'EXISTS'],
      ],
    ]);

    $menu_to_activities = [];
    $menu_ids = [];
    foreach ($activities as $p) {
      $menu_post_id = (int)get_post_meta($p->ID, 'dmn_menu_post_id', true);
      if ($menu_post_id <= 0) continue;
      $menu_ids[$menu_post_id] = $menu_post_id;
      $menu_to_activities[$menu_post_id] ??= [];
      $menu_to_activities[$menu_post_id][] = [
        'id' => $p->ID,
        'dmn_type_id' => (string)get_post_meta($p->ID, 'dmn_type_id', true),
        'name' => (string)(get_post_meta($p->ID, 'display_name', true) ?: $p->post_title),
      ];
    }

    if (!$menu_ids) {
      return new WP_REST_Response(['menus' => []], 200);
    }

    // Menu titles
    $menus_posts = get_posts([
      'post_type' => 'dmn_menu',
      'post__in' => array_values($menu_ids),
      'numberposts' => -1,
      'fields' => 'all',
    ]);
    $menu_titles = [];
    foreach ($menus_posts as $mp) {
      $menu_titles[$mp->ID] = $mp->post_title;
    }

    // Items under those menus
    $items = get_posts([
      'post_type' => 'dmn_menu_item',
      'numberposts' => -1,
      'fields' => 'all',
      'meta_query' => [
        [
          'key' => '_dmn_menu_post_id',
          'value' => array_values($menu_ids),
          'compare' => 'IN',
        ],
      ],
    ]);

    $grouped = [];
    foreach ($items as $it) {
      $menu_post_id = (int)get_post_meta($it->ID, '_dmn_menu_post_id', true);
      if ($menu_post_id <= 0) continue;
      $img_id = (int)get_post_thumbnail_id($it->ID);
      $grouped[$menu_post_id] ??= [];
      $grouped[$menu_post_id][] = [
        'id' => $it->ID,
        'name' => $it->post_title,
        'description' => $it->post_content,
        'type' => (string)get_post_meta($it->ID, '_dmn_item_type', true),
        'price_ro' => (float)get_post_meta($it->ID, '_dmn_item_price_ro', true),
        'image_id' => $img_id ?: null,
        'image_url' => $img_id ? wp_get_attachment_image_url($img_id, 'medium') : null,
        'dmn_item_id' => (string)get_post_meta($it->ID, '_dmn_item_id', true),
        'menu_post_id' => $menu_post_id,
      ];
    }

    $out = [];
    foreach ($menu_ids as $mid) {
      $out[] = [
        'menu_post_id' => (int)$mid,
        'menu_title' => (string)($menu_titles[$mid] ?? 'Menu'),
        'activities' => array_values($menu_to_activities[$mid] ?? []),
        'items' => array_values($grouped[$mid] ?? []),
      ];
    }

    usort($out, fn($a, $b) => strcmp($a['menu_title'], $b['menu_title']));

    return new WP_REST_Response(['menus' => $out], 200);
  }

  /**
   * Update a dmn_menu_item.
   *
   * @param WP_REST_Request $r Request with route 'id' and JSON body.
   * @return WP_REST_Response 200 on success, 404 on missing post.
   */
  public function dmn_admin_save_menu_item(WP_REST_Request $r): WP_REST_Response
  {
    $id = (int)$r['id'];
    $p = get_post($id);
    if (!$p || $p->post_type !== 'dmn_menu_item') {
      return new WP_REST_Response(['message' => 'Not found'], 404);
    }

    $b = $r->get_json_params() ?: [];

    if (array_key_exists('name', $b)) {
      wp_update_post(['ID' => $id, 'post_title' => sanitize_text_field($b['name'] ?? '')]);
    }
    if (array_key_exists('description', $b)) {
      wp_update_post(['ID' => $id, 'post_content' => wp_kses_post($b['description'] ?? '')]);
    }
    if (array_key_exists('image_id', $b)) {
      $img_id = (int)$b['image_id'];
      if ($img_id > 0) {
        set_post_thumbnail($id, $img_id);
      } else {
        delete_post_thumbnail($id);
      }
    }

    return new WP_REST_Response(['ok' => true], 200);
  }

  /**
   * GET /dmn/v1/admin/faqs
   *
   * Return FAQs for a venue.
   *
   * @param WP_REST_Request $req Request with 'venue_id' param.
   * @return WP_REST_Response {faqs: [{question,answer}]}
   */
  public function dmn_admin_faqs_get(WP_REST_Request $req): WP_REST_Response
  {
    $venue_id = (int)$req->get_param('venue_id');
    $faqs = get_post_meta($venue_id, 'dmn_faqs', true);
    if (!is_array($faqs)) $faqs = [];

    $faqs = array_values(array_map(
      fn($r) => [
        'question' => isset($r['question']) ? (string)$r['question'] : '',
        'answer' => isset($r['answer']) ? (string)$r['answer'] : '',
      ],
      $faqs
    ));

    return new WP_REST_Response(['faqs' => $faqs], 200);
  }

  /**
   * POST /dmn/v1/admin/faqs
   *
   * Save FAQs for a venue.
   *
   * @param WP_REST_Request $req JSON body with 'venue_id' and 'faqs'.
   * @return WP_Error|WP_REST_Response Error on bad input or {ok:true}.
   */
  public function dmn_admin_faqs_save(WP_REST_Request $req): WP_Error|WP_REST_Response
  {
    $json = $req->get_json_params();
    $venue_id = (int)($json['venue_id'] ?? $req->get_param('venue_id'));
    $faqs = $json['faqs'] ?? $req->get_param('faqs');

    if (!$venue_id || !is_array($faqs)) {
      return new WP_Error('bad_request', 'venue_id and faqs required', ['status' => 400]);
    }

    $clean = [];
    foreach ($faqs as $row) {
      $clean[] = [
        'question' => isset($row['question']) ? wp_kses_post($row['question']) : '',
        'answer' => isset($row['answer']) ? wp_kses_post($row['answer']) : '',
      ];
    }

    update_post_meta($venue_id, 'dmn_faqs', $clean);

    return new WP_REST_Response(['ok' => true], 200);
  }

  /**
   * Retrieve the large group enquiry link details for a venue.
   *
   * Accepts a REST request with a 'venue_id' parameter, fetches the large group
   * enquiry URL, label, and minimum group size from post meta, and returns them.
   * Provides default values for label and minSize if not set.
   *
   * @param WP_REST_Request $req REST request containing 'venue_id'.
   * @return WP_REST_Response Response with 'enabled', 'minSize', 'label', and 'url'.
   */
  public function dmn_admin_large_group_link_get(WP_REST_Request $req): WP_REST_Response
  {
    $venue_id = (int)$req->get_param('venue_id');
    if ($venue_id <= 0) {
      return new WP_REST_Response(['error' => 'venue_id required'], 400);
    }

    $url = (string)get_post_meta($venue_id, 'dmn_large_group_url', true);
    $label = (string)get_post_meta($venue_id, 'dmn_large_group_label', true);
    $min = (int)get_post_meta($venue_id, 'dmn_large_group_min', true);

    if ($label === '') $label = 'Groups of 12+ — Enquire here';
    if ($min <= 0) $min = 12;

    return new WP_REST_Response([
      'enabled' => $url !== '',
      'minSize' => $min,
      'label' => $label,
      'url' => $url,
    ], 200);
  }


  /**
   * Save or update the large group enquiry link for a venue.
   *
   * Accepts a REST request with JSON body containing 'venue_id', 'url', optional 'label', and optional 'minSize'.
   * Validates the input, updates the relevant post meta fields, and returns a success response.
   *
   * @param WP_REST_Request $req REST request with large group link data.
   * @return WP_REST_Response 200 on success, 400 on invalid input.
   */
  public function dmn_admin_large_group_link_save(WP_REST_Request $req): WP_REST_Response
  {
    $b = $req->get_json_params() ?: $req->get_body_params();

    $venue_id = isset($b['venue_id']) ? (int)$b['venue_id'] : 0;
    if ($venue_id <= 0) {
      return new WP_REST_Response(['error' => 'venue_id required'], 400);
    }

    $url = isset($b['url']) ? trim((string)$b['url']) : '';
    if ($url !== '' && !preg_match('#^(https?://|/)#i', $url)) {
      return new WP_REST_Response(['error' => 'Invalid URL'], 400);
    }

    // persist
    update_post_meta($venue_id, 'dmn_large_group_url', mb_substr($url, 0, 300));

    if (array_key_exists('label', $b)) {
      $label = sanitize_text_field((string)$b['label']);
      update_post_meta($venue_id, 'dmn_large_group_label', mb_substr($label, 0, 80));
    }

    if (array_key_exists('minSize', $b)) {
      $min = max(1, (int)$b['minSize']);
      update_post_meta($venue_id, 'dmn_large_group_min', $min);
    }

    return new WP_REST_Response(['ok' => true], 200);
  }
}


