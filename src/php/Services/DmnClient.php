<?php

namespace DMN\Booking\Services;

use DMN\Booking\Config\Settings;

class DmnClient
{
  /**
   * GET /v4/venues
   * $params can include: venue_group, fields (comma string), page, per_page, etc.
   */
  public function get_venues(array $params = []): array
  {
    if (empty($params['fields'])) {
      $params['fields'] = 'path,name,title';
    }
    return $this->request('GET', '/venues', $params);
  }

  /**
   * Core HTTP wrapper for DMN v4.
   *
   * Returns a minimal, de-duplicated structure:
   * - ok: bool
   * - status: int
   * - data: mixed (decoded JSON or null)
   * - error: ?string
   * - validation: ?array
   */
  public function request(string $method, string $path, array $query = [], $body = null): array
  {
    $base = rtrim($this->base_url(), '/');
    $path = '/' . ltrim($path, '/');
    $url = $base . $path;

    if (!empty($query)) {
      $url = add_query_arg($query, $url);
    }

    $headers = array_filter([
      'Authorization' => $this->auth_header(),                            // DMN expects APP_ID:API_KEY
      'Accept' => 'application/json; charset=utf-8',
      // Only send Content-Type when we actually have a body
      'Content-Type' => $body !== null ? 'application/json; charset=utf-8' : null,
      'User-Agent' => $this->user_agent(),
    ]);

    $args = [
      'method' => $method,
      'timeout' => 20,
      'redirection' => 3,
      'headers' => $headers,
    ];

    if ($body !== null) {
      $args['body'] = is_string($body) ? $body : wp_json_encode($body);
    }

    // Cache GETs briefly to ease rate limits
    $cache_ttl = ($method === 'GET') ? 60 : 0;
    $cache_key = null;

    if ($cache_ttl > 0) {
      $cache_key = 'dmn:' . md5($method . ' ' . $url);
      $cached = wp_cache_get($cache_key, 'dmn');
      if (is_array($cached)) {
        return $cached;
      }
    }

    // One soft retry on 429 (<=5s)
    $do_request = fn() => wp_remote_request($url, $args);
    $res = $do_request();

    if (!is_wp_error($res) && (int)wp_remote_retrieve_response_code($res) === 429) {
      $retry = (int)(wp_remote_retrieve_header($res, 'retry-after') ?: 0);
      if ($retry > 0 && $retry <= 5) {
        sleep($retry);
        $res = $do_request();
      }
    }

    if (is_wp_error($res)) {
      $out = [
        'ok' => false,
        'status' => 0,
        'data' => null,
        'error' => $res->get_error_message(),
        'validation' => null,
      ];
      if ($cache_ttl > 0 && $cache_key) wp_cache_set($cache_key, $out, 'dmn', $cache_ttl);
      return $out;
    }

    $code = (int)wp_remote_retrieve_response_code($res);
    $raw = wp_remote_retrieve_body($res);
    $json = json_decode($raw, true);

    // Extract a concise error + validation when present (common DMN payload shape)
    $error = null;
    $validation = null;

    if ($code >= 400 && is_array($json)) {
      $payload = $json['payload'] ?? null;
      $error = is_array($payload) ? ($payload['message'] ?? null) : null;
      $validation = is_array($payload) ? ($payload['validation'] ?? null) : null;

      if (!$error) {
        $error = $json['message'] ?? ($json['error'] ?? null);
      }
      if (!$error && isset($json['errors']) && is_array($json['errors'])) {
        $parts = [];
        foreach ($json['errors'] as $e) {
          $parts[] = is_array($e) ? ($e['message'] ?? wp_json_encode($e)) : (string)$e;
        }
        $error = implode('; ', array_filter($parts));
      }
    }

    $out = [
      'ok' => ($code >= 200 && $code < 300),
      'status' => $code,
      'data' => $json ?? null,
      'error' => $error,
      'validation' => $validation,
    ];

    if ($cache_ttl > 0 && $cache_key) {
      wp_cache_set($cache_key, $out, 'dmn', $cache_ttl);
    }
    return $out;
  }

  private function base_url(): string
  {
    return Settings::get_env() === 'qa'
      ? 'https://api-qa.designmynight.com/v4'
      : 'https://api.designmynight.com/v4';
  }

  private function auth_header(): string
  {
    $id = trim((string)Settings::get_app_id());
    $key = trim((string)Settings::get_api_key());
    // DMN v4 expects APP_ID:API_KEY in Authorization
    return "{$id}:{$key}";
  }

  private function user_agent(): string
  {
    $site = parse_url(get_site_url(), PHP_URL_HOST) ?: 'unknown-host';
    // Fix: reference the correct constant name
    $ver = defined('DMN_PLUGIN_VERSION') ? DMN_BP_VER : 'dev';
    return "DMN-Booking-Plugin/{$ver} (+{$site})";
  }

  /**
   * POST /v4/venues/{venue_id}/booking-availability
   */
  public function booking_availability(string $venue_id, array $body, array $query = []): array
  {
    $venue_id = trim($venue_id);
    return $this->request('POST', "/venues/{$venue_id}/booking-availability", $query, $body);
  }

  /**
   * POST /v4/bookings
   */
  public function create_booking(array $payload): array
  {
    return $this->request('POST', '/bookings', [], $payload);
  }
}
