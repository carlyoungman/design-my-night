<?php

namespace DMN\Booking\Rest;

use DMN\Booking\Services\DmnClient;
use Throwable;
use WP_Error;
use WP_Post;
use WP_Query;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

class PublicController
{
  /**
   * POST /dmn/v1/create-booking
   * Accepts { addons: [] } from front-end and maps to DMN "packages"
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

  // In src/php/Rest/PublicController.php, inside the PublicController class

  /**
   * Handles the creation of a booking via the DMN API.
   *
   * Extracts allowed booking fields from the request payload, sends them to the DMN API,
   * and returns the API response as a WP_REST_Response.
   *
   * @param WP_REST_Request $req The REST request containing booking data.
   * @return WP_REST_Response The response from the DMN API, including debug info.
   */

  /**
   * GET /dmn/v1/addons?venue_id=.&activity_id=..
   * Returns add-ons mapped to the front-end shape used in Addons.tsx
   */
  public static function get_addons(WP_REST_Request $r): WP_REST_Response
  {
    // Inputs (DMN external IDs as strings)
    $venue_ext_id = (string)($r->get_param('venue_id') ?? '');
    $activity_id = (string)($r->get_param('activity_id') ?? '');

    if ($venue_ext_id === '') {
      return new WP_REST_Response(['message' => 'The venue_id parameter is required.'], 400);
    }

    // 1) Map external DMN venue id -> local dmn_venue post ID
    $venue_posts = get_posts([
      'post_type' => 'dmn_venue',
      'numberposts' => 1,
      'fields' => 'ids',
      'meta_query' => [[
        'key' => 'dmn_venue_id',
        'value' => $venue_ext_id,
      ]],
      'no_found_rows' => true,
    ]);
    if (empty($venue_posts)) {
      return new WP_REST_Response(['data' => []], 200);
    }
    $venue_post_id = (int)$venue_posts[0];

    // 2) Find activities under this venue that have a menu assigned (optionally filter by type)
    $activity_meta = [
      ['key' => 'dmn_menu_post_id', 'compare' => 'EXISTS'],
    ];
    if ($activity_id !== '') {
      $activity_meta[] = [
        'relation' => 'OR',
        ['key' => 'dmn_type_id', 'value' => $activity_id],
        ['key' => 'dmn_type_ids', 'value' => '"' . $activity_id . '"', 'compare' => 'LIKE'],
        // keep these fallbacks if you used older keys at any point:
        ['key' => 'activity_id', 'value' => $activity_id],
        ['key' => 'activity_ids', 'value' => '"' . $activity_id . '"', 'compare' => 'LIKE'],
      ];
    }

    $activities = get_posts([
      'post_type' => 'dmn_activity',
      'post_parent' => $venue_post_id,           // <-- local ID (fix)
      'numberposts' => -1,
      'fields' => 'ids',
      'orderby' => 'menu_order title',
      'order' => 'ASC',
      'meta_query' => $activity_meta,
      'no_found_rows' => true,
    ]);

    // 3) Collect menu IDs from those activities
    if (empty($activities)) {
      return new WP_REST_Response(['data' => []], 200);
    }
    $menu_ids = [];
    foreach ($activities as $aid) {
      $mid = (int)get_post_meta((int)$aid, 'dmn_menu_post_id', true);
      if ($mid > 0) $menu_ids[$mid] = $mid;
    }
    if (empty($menu_ids)) {
      return new WP_REST_Response(['data' => []], 200);
    }

    // 4) Load menu items linked to those menus
    $items = get_posts([
      'post_type' => 'dmn_menu_item',
      'posts_per_page' => -1,
      'meta_query' => [[
        'key' => '_dmn_menu_post_id',
        'value' => array_values($menu_ids),
        'compare' => 'IN',
      ]],
      'no_found_rows' => true,
    ]);

    // 5) Map to frontend AddOnPackage shape (flat list)
    $out = [];
    foreach ($items as $it) {
      $img_id = (int)get_post_thumbnail_id($it->ID);
      $image_url = $img_id ? wp_get_attachment_image_url($img_id, 'medium') : null;
      $price_ro = get_post_meta($it->ID, '_dmn_item_price_ro', true);
      $price_num = is_numeric($price_ro) ? (float)$price_ro : null;

      $out[] = [
        'id' => (string)$it->ID,
        'name' => (string)$it->post_title,
        'description' => (string)apply_filters('the_content', $it->post_content),
        'priceText' => $price_num !== null ? '£' . number_format($price_num, 2) : '',
        'image_url' => $image_url,
        'visible' => true,
        'dmn_package_id' => (string)(get_post_meta($it->ID, '_dmn_item_id', true) ?: $it->ID),
      ];
    }

    return new WP_REST_Response(['data' => array_values($out)], 200);
  }


  /**
   * Registers all public REST API routes for the DMN Booking plugin.
   * Each route is mapped to a callback for handling requests.
   * This includes endpoints for venues, booking availability, bookings, packages, and booking types.
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
      ],
    ]);
    // GET /dmn/v1/addons
    register_rest_route('dmn/v1', '/addons', [
      'methods' => 'GET',
      'callback' => [self::class, 'get_addons'],
      'permission_callback' => '__return_true',
      'args' => [
        'venue_id' => ['type' => 'string', 'required' => true],
        'activity_id' => ['type' => 'string', 'required' => false],
      ],
    ]);

    register_rest_route('dmn/v1', '/public/faqs', [
      [
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => '__return_true',
        'callback' => [$this, 'dmn_public_faqs_get'],
        'args' => [
          'venue_id' => ['required' => true, 'type' => 'string'],
        ],
      ],
    ]);

    register_rest_route('dmn/v1', '/public/large-group-link', [
      [
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => '__return_true',
        'callback' => [$this, 'dmn_public_large_group_link_get'],
        'args' => [
          'venue_id' => ['required' => true, 'type' => 'string'],
        ],
      ],
    ]);
  }

  /**
   * Retrieves a list of venues from the DMN API, optionally filtered by venue group.
   *
   * @param WP_REST_Request $req The REST request containing optional query parameters.
   * @return WP_REST_Response The response with venue data, status, error, and debug info.
   */
  public function venues(WP_REST_Request $req): WP_REST_Response
  {
    $query = [];
    if ($vg = $req->get_param('venue_group')) {
      $query['venue_group'] = sanitize_text_field($vg);
    }
    // Keep payload lean per DMN guidance
    $query['fields'] = $req->get_param('fields') ? sanitize_text_field((string)$req->get_param('fields')) : 'path,name,title';

    $dmn = new DmnClient();
    $res = $dmn->request('GET', '/venues', $query, null);

    return new WP_REST_Response([
      'data' => $res['data'] ?? null,
      'status' => $res['status'] ?? 0,
      'error' => $res['error'] ?? null,
      'debug' => $res,
    ], $res['ok'] ? 200 : ($res['status'] ?: 500));
  }

  /**
   * Retrieves booking availability for a given venue from the DMN API.
   *
   * Validates the required `venue_id`, builds the request payload from provided parameters,
   * and returns available booking slots, validation info, and debug data.
   *
   * @param WP_REST_Request $req The REST request containing booking search parameters.
   * @return WP_REST_Response The response with availability data, status, error, validation, and debug info.
   */
  public function availability(WP_REST_Request $req): WP_REST_Response
  {
    $p = (array)($req->get_json_params() ?? []);
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
      'getOffers' => isset($p['getOffers']) ? (bool)$p['getOffers'] : null,
    ], fn($v) => $v !== null);

    $dmn = new DmnClient();
    $res = $dmn->request('POST', "/venues/{$venueId}/booking-availability", $q, $payload);

    // Expose validation (for suggestedValues of type/time)
    $validation = $res['validation'] ?? ($res['data']['payload']['validation'] ?? null);

    return new WP_REST_Response([
      'data' => $res['data'] ?? null,
      'status' => $res['status'] ?? 0,
      'error' => $res['error'] ?? null,
      'validation' => $validation,
      'debug' => $res, // include full debug blob
    ], $res['ok'] ? 200 : ($res['status'] ?: 500));
  }

  /**
   * Retrieves available booking types for a given venue by merging DMN API suggestions with WordPress-configured activities.
   *
   * I now preserve DMD's `auto confirmable` flag on each type so the front-end can check/label/sort accordingly.
   *
   * @param WP_REST_Request $r The REST request containing venue and optional filter parameters.
   * @return WP_REST_Response The response with merged booking type data.
   */
  function get_booking_types(WP_REST_Request $r): WP_REST_Response
  {
    $venueExtId = sanitize_text_field((string)$r->get_param('venue_id'));
    if (!$venueExtId) {
      return new WP_REST_Response(['data' => [], 'reason' => 'missing_venue_id'], 200);
    }

    $date = $r->get_param('date') ?: gmdate('Y-m-d');
    // allow either num_people or party_size
    $numPeople = (int)($r->get_param('num_people') ?: $r->get_param('party_size') ?: 2);

    // 1) DMN suggestions (venue-scoped + fields=type)
    $client = new DmnClient();
    $payload = ['num_people' => $numPeople, 'date' => $date];

    $dmnResp = $client->request(
      'POST',
      "/venues/{$venueExtId}/booking-availability",
      ['fields' => 'type'],
      $payload
    );

    // Use `valid` + `message` from DMN instead of `auto confirmable`
    $suggested = []; // [typeId => ['id','name','valid','message']]
    if (!empty($dmnResp['ok'])) {
      $data = $dmnResp['data'] ?? [];
      $validation = $data['payload']['validation'] ?? null;
      $sv = $validation['type']['suggestedValues'] ?? [];
      if (is_array($sv)) {
        foreach ($sv as $item) {
          // supports { value:{id,name,...}, valid, message } OR {id,name} OR "id"
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

    // 2) WP-configured activities under the matching venue post
    $venuePosts = get_posts([
      'post_type' => 'dmn_venue',
      'numberposts' => 1,
      'fields' => 'ids',
      'meta_key' => 'dmn_venue_id',
      'meta_value' => $venueExtId,
    ]);
    $configuredById = [];

    if ($venuePosts) {
      $venuePostId = (int)$venuePosts[0];
      $acts = get_posts([
        'post_type' => 'dmn_activity',
        'post_parent' => $venuePostId,
        'numberposts' => 100,
        'orderby' => 'menu_order title',
        'order' => 'ASC',
      ]);

      foreach ($acts as $p) {
        /** @var WP_Post $p */
        $typeId = (string)get_post_meta($p->ID, 'dmn_type_id', true);
        if (!$typeId) continue;

        $imgId = (int)get_post_thumbnail_id($p->ID);

        $configuredById[$typeId] = [
          'id' => $typeId,
          'name' => get_the_title($p->ID),
          'description' => (string)get_post_meta($p->ID, 'short_description', true),
          'priceText' => (string)get_post_meta($p->ID, 'price_text', true),
          'image_id' => $imgId ?: null,
          'image_url' => $imgId ? wp_get_attachment_image_url($imgId, 'large') : null,
        ];
      }
    }

    // 3) Merge DMN + WP
    $out = [];
    if (!empty($suggested)) {
      foreach ($suggested as $id => $base) {
        $conf = $configuredById[$id] ?? null;


        $valid = array_key_exists('valid', $base) ? $base['valid'] : null;
        $msg = array_key_exists('message', $base) ? ($base['message'] ?? '') : '';

        // If invalid and DMN provided a message → show that message in place of WP description
        $description = ($valid === false && $msg) ? $msg : ($conf['description'] ?? '');

        $out[] = [
          'id' => $id,
          'name' => $conf['name'] ?? $base['name'],
          'description' => $description,
          'priceText' => $conf['priceText'] ?? '',
          'image_id' => $conf['image_id'] ?? null,
          'image_url' => $conf['image_url'] ?? null,
          'valid' => $valid,
          'message' => $msg ?: null,
        ];
      }
    } else {
      // fallback: configured only
      foreach ($configuredById as $conf) {
        $out[] = [
          'id' => $conf['id'],
          'name' => $conf['name'],
          'description' => $conf['description'],
          'priceText' => $conf['priceText'],
          'image_id' => $conf['image_id'],
          'image_url' => $conf['image_url'],
          'valid' => null,
          'message' => null,
        ];
      }
    }

    // Sort: invalid (valid === false) to the end; A–Z within group
    usort($out, static function (array $a, array $b): int {
      $aInvalid = array_key_exists('valid', $a) && $a['valid'] === false;
      $bInvalid = array_key_exists('valid', $b) && $b['valid'] === false;
      if ($aInvalid !== $bInvalid) return $aInvalid ? 1 : -1;

      $an = (string)($a['name'] ?? '');
      $bn = (string)($b['name'] ?? '');
      $cmp = strcasecmp($an, $bn);
      if ($cmp !== 0) return $cmp;

      return strcasecmp((string)($a['id'] ?? ''), (string)($b['id'] ?? ''));
    });

    return new WP_REST_Response(['data' => $out], 200);
  }

  /** ---- Public: FAQs ---- */
  public function dmn_public_faqs_get(WP_REST_Request $req): WP_REST_Response
  {
    $venue_param = $req->get_param('venue_id');
    $post_id = $this->resolve_venue_post_id($venue_param);
    if ($post_id <= 0) {
      return new WP_REST_Response(['faqs' => [], 'error' => 'venue not found'], 404);
    }
    $faqs = get_post_meta($post_id, 'dmn_faqs', true);
    if (!is_array($faqs)) $faqs = [];
    // normalise
    $faqs = array_values(array_map(function ($f) {
      return [
        'question' => isset($f['question']) ? (string)$f['question'] : '',
        'answer' => isset($f['answer']) ? (string)$f['answer'] : '',
      ];
    }, $faqs));
    return new WP_REST_Response(['faqs' => $faqs], 200);
  }

  /** ---- Helpers ---- */
  private function resolve_venue_post_id($venue_id_param): int
  {
    // numeric WP post ID
    if (is_numeric($venue_id_param)) {
      $pid = (int)$venue_id_param;
      return $pid > 0 ? $pid : 0;
    }
    // DMN venue id stored in post meta 'dmn_id'
    $dmn_id = (string)$venue_id_param;
    $ids = get_posts([
      'post_type' => 'any',
      'posts_per_page' => 1,
      'fields' => 'ids',
      'no_found_rows' => true,
      'meta_key' => 'dmn_id',
      'meta_value' => $dmn_id,
    ]);
    return !empty($ids) ? (int)$ids[0] : 0;
  }

  /** ---- Public: Large group link ---- */
  public function dmn_public_large_group_link_get(WP_REST_Request $req): WP_REST_Response
  {
    $venue_param = $req->get_param('venue_id');
    $post_id = $this->resolve_venue_post_id($venue_param);
    if ($post_id <= 0) {
      return new WP_REST_Response([
        'enabled' => false, 'minSize' => 12, 'label' => 'Groups of 12+ — Enquire here', 'url' => '',
        'error' => 'venue not found',
      ], 404);
    }

    $url = (string)get_post_meta($post_id, 'dmn_large_group_url', true);
    $label = (string)get_post_meta($post_id, 'dmn_large_group_label', true);
    $min = (int)get_post_meta($post_id, 'dmn_large_group_min', true);

    if ($label === '') $label = 'Groups of 12+ — Enquire here';
    if ($min <= 0) $min = 12;

    return new WP_REST_Response([
      'enabled' => $url !== '',
      'minSize' => $min,
      'label' => $label,
      'url' => $url,
    ], 200);
  }

}
