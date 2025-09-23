<?php

namespace DMN\Booking\Rest;

use DMN\Booking\Services\DmnClient;
use Throwable;
use WP_Error;
use WP_Post;
use WP_Query;
use WP_REST_Request;
use WP_REST_Response;

class PublicController
{
  /**
   * Registers all public REST API routes for the DMN Booking plugin.
   * Each route is mapped to a callback for handling requests.
   * This includes endpoints for venues, booking availability, bookings, packages, and booking types.
   */
  public function register_routes(): void
  {
    /**
     * Registers the /venues REST API endpoint for retrieving venue data.
     *
     * Method: GET
     * Callback: PublicController::venues
     * Permission: Public (no authentication required) */
    register_rest_route('dmn/v1', '/venues', [
      'methods' => 'GET',
      'permission_callback' => '__return_true',
      'callback' => [$this, 'venues'],
    ]);
    /**
     * Registers the /booking-availability REST API endpoint for retrieving booking slot availability.
     *
     * Method: POST
     * Callback: PublicController::availability
     * Permission: Public (no authentication required) */
    register_rest_route('dmn/v1', '/booking-availability', [
      'methods' => 'POST',
      'permission_callback' => '__return_true',
      'callback' => [$this, 'availability'],
    ]);


    /**
     * Registers the /bookings REST API endpoint for creating a new booking via the DMN API.
     *
     * Method: POST
     * Callback: PublicController::create_booking
     * Permission: Public (no authentication required) */
    register_rest_route('dmn/v1', '/bookings', [
      'methods' => 'POST',
      'permission_callback' => '__return_true',
      'callback' => [$this, 'create_booking'],
    ]);

    /**
     * Registers the /packages REST API endpoint for retrieving packages associated with a specific venue.
     *
     * Method: GET
     * Callback: Anonymous function querying dmn_package CPTs by venue_id
     * Permission: Public (no authentication required) */
    register_rest_route(
      'dmn/v1',
      '/packages',
      [
        'methods' => 'GET',
        'callback' => [$this, 'packages'],
        'permission_callback' => '__return_true',
      ]
    );

    /**
     * Registers the /create-booking REST API endpoint for creating a booking using the DMN API via an inline callback.
     *
     * Method: POST
     * Callback: Anonymous function calling DmnClient::create_booking
     * Permission: Public (no authentication required) */
    register_rest_route('dmn/v1', '/create-booking', [
      'methods' => 'POST',
      'callback' => function (WP_REST_Request $req) {
        $body = (array)$req->get_json_params();

        $dmn = new DmnClient();
        $resp = $dmn->create_booking($body);

        return new WP_REST_Response([
          'data' => $resp['data'] ?? null,
          'status' => $resp['status'] ?? 0,
          'error' => $resp['error'] ?? null,
          'debug' => $resp,
        ], $resp['ok'] ? 200 : ($resp['status'] ?: 500));
      },
      'permission_callback' => '__return_true',
    ]);

    /**
     * Registers the /booking-types REST API endpoint for retrieving available booking types for a specific venue.
     *
     * Method: GET
     * Callback: PublicController::get_booking_types
     * Permission: Public (no authentication required)
     * Args:
     * venue_id (string, required)
     * date (string, optional)
     * num_people (integer, optional)
     * party_size (integer, optional) */
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
  public function create_booking(WP_REST_Request $req): WP_REST_Response
  {
    $body = $req->get_json_params();

    try {
      $dmn = new DmnClient();

      // If your client already prefixes /v4, use '/bookings'; otherwise use '/v4/bookings'
      $dmnRes = $dmn->request('POST', '/bookings', [], $body);
      // $dmnRes might be an array, object, or WP_Error depending on your client.

      // 1) Handle hard transport errors
      if (is_wp_error($dmnRes)) {
        return new WP_REST_Response([
          'error' => 'transport_error',
          'message' => $dmnRes->get_error_message(),
        ], 502);
      }

      // 2) Normalise common shapes
      $status = 200;
      $rawBody = null;
      $decoded = null;

      if (is_array($dmnRes)) {
        // Try typical shapes:
        $status = $dmnRes['status'] ?? $dmnRes['response']['code'] ?? 200;
        $rawBody = $dmnRes['body'] ?? $dmnRes['response']['body'] ?? null;

        // Some clients already return decoded JSON:
        if (!$rawBody && isset($dmnRes['data'])) {
          $decoded = $dmnRes['data'];
        }
      } elseif (is_object($dmnRes) && method_exists($dmnRes, 'getBody')) {
        // Guzzle-like
        $status = method_exists($dmnRes, 'getStatusCode') ? $dmnRes->getStatusCode() : 200;
        $rawBody = (string)$dmnRes->getBody();
      } else {
        // Fallback: treat as already-decoded data
        $decoded = $dmnRes;
      }

      // 3) Decode JSON body if present
      if ($decoded === null && is_string($rawBody)) {
        $decoded = json_decode($rawBody, true);
      }

      // 4) If DMN returned an error (>=400), expose useful bits
      if ((int)$status >= 400) {
        // DMN usually returns a message + validation payload
        $details = [
          'status' => (int)$status,
          'dmn_message' => $decoded['message'] ?? $decoded['error'] ?? 'Unknown DMN error',
          'validation' =>
            $decoded['payload']['validation'] ??
              $decoded['validation'] ??
              null,
          // optional — helps you debug what you sent (avoid logging PII in prod)
          'echo_payload' => (defined('WP_DEBUG') && WP_DEBUG) ? $body : null,
          // raw only in debug to avoid noisy responses in prod
          'raw' => (defined('WP_DEBUG') && WP_DEBUG) ? ($rawBody ?? json_encode($decoded)) : null,
        ];

        return new WP_REST_Response([
          'error' => 'dmn_error',
          'details' => $details,
        ], (int)$status);
      }

      // 5) Success passthrough (return decoded JSON if possible)
      return new WP_REST_Response($decoded ?? $dmnRes, 200);

    } catch (Throwable $e) {
      return new WP_REST_Response([
        'error' => 'exception',
        'message' => $e->getMessage(),
      ], 500);
    }
  }


  /**
   * Retrieves add‑on packages for the specified venue.
   *
   * @param WP_REST_Request $req The incoming REST request.
   * @return WP_REST_Response    A response containing an array of package objects.
   */
  public function packages(WP_REST_Request $req): WP_REST_Response
  {
    $venue_id = sanitize_text_field($req->get_param('venue_id'));

    // Build query arguments for dmn_package posts.
    $args = [
      'post_type' => 'dmn_package',
      'posts_per_page' => 100,
      'orderby' => 'menu_order',
      'order' => 'ASC',
      'no_found_rows' => true,
    ];
    if ($venue_id !== '') {
      $args['meta_query'] = [
        [
          'key' => '_dmn_pkg_venue_ids',
          'value' => '"' . $venue_id . '"',
          'compare' => 'LIKE',
        ],
      ];
    }

    $query = new WP_Query($args);
    $data = [];

    while ($query->have_posts()) {
      $query->the_post();
      $id = get_the_ID();
      $price = (string)get_post_meta($id, '_dmn_pkg_price_text', true);
      $visible = (bool)get_post_meta($id, '_dmn_pkg_visible', true);
      $venueIds = (array)get_post_meta($id, '_dmn_pkg_venue_ids', true);
      $imgId = get_post_thumbnail_id($id);
      $imgUrl = $imgId ? wp_get_attachment_image_url($imgId, 'large') : null;

      $data[] = [
        'id' => (string)$id,
        'name' => get_the_title(),
        'description' => get_the_content(),
        'priceText' => $price ?: null,
        'image_url' => $imgUrl,
        // Only mark visible if the post is published and the visible flag is true.
        'visible' => (get_post_status($id) === 'publish') && $visible,
        'venueIds' => array_values(array_map('strval', $venueIds)),
      ];
    }

    wp_reset_postdata();

    return new WP_REST_Response(['data' => $data], 200);
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
      'debug' => $res, // include full debug blob
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
   * Fetches suggested booking types from the DMN API and overlays them with local activity data configured in WordPress,
   * including additional metadata such as description, price text, and images. Falls back to local configuration if the API returns no suggestions.
   *
   * @param WP_REST_Request $r The REST request containing venue and optional filter parameters.
   * @return WP_REST_Response The response with merged booking type data.
   */
  /**
   * Retrieves available booking types for a given venue by merging DMN API suggestions with WordPress-configured activities.
   *
   * I now preserve DMN's `auto confirmable` flag on each type so the front-end can check/label/sort accordingly.
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

}
