<?php

namespace DMN\Booking\Rest;

use DMN\Booking\Services\DmnClient;
use WP_Query;
use WP_REST_Request;
use WP_REST_Response;

class PublicController
{
  public function register_routes(): void
  {
    register_rest_route('dmn/v1', '/venues', [
      'methods' => 'GET',
      'permission_callback' => '__return_true',
      'callback' => [$this, 'venues'],
    ]);

    register_rest_route('dmn/v1', '/booking-availability', [
      'methods' => 'POST',
      'permission_callback' => '__return_true',
      'callback' => [$this, 'availability'],
    ]);

    // Optional for API submission (we’ll default to web redirect in the frontend)
    register_rest_route('dmn/v1', '/bookings', [
      'methods' => 'POST',
      'permission_callback' => '__return_true',
      'callback' => [$this, 'create_booking'],
    ]);

    register_rest_route('dmn/v1', '/packages', [
      'methods' => 'GET',
      'callback' => function (WP_REST_Request $req) {
        $venue_id = sanitize_text_field($req->get_param('venue_id'));
        // Query CPT "dmn_package" with meta_key=venue_id (adjust to your naming)
        $q = new WP_Query([
          'post_type' => 'dmn_package',
          'posts_per_page' => 100,
          'meta_query' => [['key' => 'venue_id', 'value' => $venue_id]],
          'orderby' => 'menu_order',
          'order' => 'ASC',
          'no_found_rows' => true,
        ]);
        $data = [];
        while ($q->have_posts()) {
          $q->the_post();
          $data[] = [
            'id' => (string)get_the_ID(),
            'label' => get_the_title(), // or build "Title — £Price"
          ];
        }
        wp_reset_postdata();
        return new WP_REST_Response(['data' => $data], 200);
      },
      'permission_callback' => '__return_true',
    ]);

    register_rest_route('dmn/v1', '/booking-types', [
      'methods' => 'GET',
      'callback' => function (WP_REST_Request $req) {
        $venue_id = sanitize_text_field($req->get_param('venue_id'));
        // Pull from ACF options / CPT / static config as you prefer:
        $types = get_option('dmn_booking_types_' . $venue_id, []);
        // Expected format: [ [id, name, description, priceText], ... ]
        $data = array_map(function ($t) {
          return [
            'id' => (string)($t['id'] ?? ''),
            'name' => (string)($t['name'] ?? ''),
            'description' => (string)($t['description'] ?? ''),
            'priceText' => (string)($t['priceText'] ?? ''),
          ];
        }, is_array($types) ? $types : []);
        return new WP_REST_Response(['data' => $data], 200);
      },
      'permission_callback' => '__return_true',
    ]);

    // Simple proxy that creates a booking via DMN and returns full debug payload
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
          'debug' => $resp, // <-- full request/response as seen by the client
        ], $resp['ok'] ? 200 : ($resp['status'] ?: 500));
      },
      'permission_callback' => '__return_true',
    ]);
  }

  public function create_booking(WP_REST_Request $req): WP_REST_Response
  {
    $p = (array)($req->get_json_params() ?? []);

    // Minimal pass-through for enquiry/booking via API when allowed by DMN
    $allowed = [
      'source', 'first_name', 'last_name', 'email', 'phone', 'dob', 'newsletter_signup',
      'marketing_preferences', 'custom_field_value', 'num_people', 'type', 'venue_id',
      'date', 'time', 'duration', 'offer', 'notes', 'package', 'return_url', 'customer'
    ];
    $payload = [];
    foreach ($allowed as $k) {
      if (array_key_exists($k, $p)) {
        $payload[$k] = $p[$k];
      }
    }

    $dmn = new DmnClient();
    $res = $dmn->request('POST', '/bookings', [], $payload);

    return new WP_REST_Response([
      'data' => $res['data'] ?? null,
      'status' => $res['status'] ?? 0,
      'error' => $res['error'] ?? null,
      'debug' => $res, // include full debug blob
    ], $res['ok'] ? 200 : ($res['status'] ?: 500));
  }

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
}
