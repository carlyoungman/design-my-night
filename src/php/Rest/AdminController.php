<?php

namespace DMN\Booking\Rest;

use DMN\Booking\Config\Settings;
use DMN\Booking\Services\DmnClient;
use WP_REST_Request;
use WP_REST_Response;

class AdminController
{
  public function register_routes(): void
  {
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

    // POST /dmn/v1/admin/settings
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

    register_rest_route('dmn/v1/admin', '/test', [
      'methods' => 'GET',
      'permission_callback' => function () {
        return current_user_can('manage_options');
      },
      'callback' => [$this, 'test_connection'],
    ]);
  }

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

    // Build debug payload if requested (even on success)
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
        'base_url' => (Settings::get_env() === 'qa'
          ? 'https://api-qa.designmynight.com/v4'
          : 'https://api.designmynight.com/v4'),
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
        // include DMN error body when present
        $debugPayload['dmn_message'] = $r['error'] ?? null;
        $debugPayload['dmn_raw_body'] = $r['raw_body'] ?? null;
      } else {
        // include a small success summary
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


}
