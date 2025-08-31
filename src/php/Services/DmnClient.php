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
    return $this->request('GET', '/venues', $params, null, ['cache_ttl' => 60]);
  }

  /**
   * Core HTTP wrapper for DMN v4.
   *
   * @return array{
   *   ok:bool,
   *   status:int,
   *   data?:mixed,
   *   error?:string|null,
   *   raw_body?:string|null,
   *   headers:array<string,string|null>,
   *   response_headers:array<string,mixed>,
   *   validation?:array|null
   * }
   */
  public function request(string $method, string $path, array $query = [], $body = null, array $opts = []): array
  {
    $base = rtrim($this->base_url(), '/');
    $path = '/' . ltrim($path, '/');
    $url = $base . $path;

    if (!empty($query)) {
      $url = add_query_arg($query, $url);
    }

    $args = [
      'method' => $method,
      'timeout' => $opts['timeout'] ?? 20,
      'redirection' => $opts['redirection'] ?? 3,
      'headers' => array_filter([
        'Authorization' => $this->auth_header(),
        'Accept' => 'application/json; charset=utf-8',
        'Content-Type' => 'application/json; charset=utf-8',
        'User-Agent' => $this->user_agent(),
      ]),
    ];

    if ($body !== null) {
      $args['body'] = is_string($body) ? $body : wp_json_encode($body);
    }

    // --- Debug: log request (redact auth) ---
    $logArgs = $args;
    if (isset($logArgs['headers']['Authorization'])) {
      $logArgs['headers']['Authorization'] = '***redacted***';
    }
    $this->log_debug('REQUEST', ['url' => $url, 'args' => $logArgs]);

    // Optional cache
    $cache_ttl = isset($opts['cache_ttl']) ? (int)$opts['cache_ttl'] : (($method === 'GET') ? 60 : 0);
    $cache_key = null;
    if ($cache_ttl > 0) {
      $cache_key = 'dmn:' . md5($method . ' ' . $url);
      $cached = wp_cache_get($cache_key, 'dmn');
      if (is_array($cached)) {
        return $cached;
      }
    }

    // One soft retry on 429
    $do_request = function () use ($url, $args) {
      return wp_remote_request($url, $args);
    };

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
        'error' => $res->get_error_message(),
        'headers' => [],
        'response_headers' => [],
      ];
      $this->log_debug('RESPONSE', $out);
      if ($cache_ttl > 0 && $cache_key) wp_cache_set($cache_key, $out, 'dmn', $cache_ttl);
      return $out;
    }

    $code = (int)wp_remote_retrieve_response_code($res);
    $headers = wp_remote_retrieve_headers($res);
    $rawBody = wp_remote_retrieve_body($res);
    $json = json_decode($rawBody, true);

    // Normalize headers to lower-case
    $hdrsArr = is_object($headers) && method_exists($headers, 'getAll')
      ? array_change_key_case($headers->getAll())
      : array_change_key_case((array)$headers);

    $errorMessage = null;
    $validation = null;

    if ($code >= 400 && is_array($json)) {
      $payload = $json['payload'] ?? null;
      if (is_array($payload)) {
        $errorMessage = $payload['message'] ?? null;
        $validation = $payload['validation'] ?? null;
      }
      if (!$errorMessage) {
        $errorMessage = $json['message'] ?? ($json['error'] ?? null);
      }
      if (!$errorMessage && isset($json['errors']) && is_array($json['errors'])) {
        $errorMessage = implode('; ', array_map(
          fn($e) => is_array($e) ? ($e['message'] ?? wp_json_encode($e)) : (string)$e,
          $json['errors']
        ));
      }
    }

    $out = [
      'ok' => ($code >= 200 && $code < 300),
      'status' => $code,
      'data' => $json,
      'error' => $errorMessage,
      'raw_body' => ($code >= 400 ? $rawBody : null),
      'headers' => [
        'X-RateLimit-Limit' => $hdrsArr['x-ratelimit-limit'] ?? 'N/A',
        'X-RateLimit-Remaining' => $hdrsArr['x-ratelimit-remaining'] ?? 'N/A',
        'X-RateLimit-Reset' => $hdrsArr['x-ratelimit-reset'] ?? 'N/A',
      ],
      'response_headers' => $hdrsArr,
      'validation' => $validation,
    ];

    // --- Debug: log response ---
    $this->log_debug('RESPONSE', [
      'status' => $code,
      'headers' => $hdrsArr,
      'body' => $json ?: $rawBody,
    ]);

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
    return "{$id}:{$key}";
  }

  private function user_agent(): string
  {
    $site = parse_url(get_site_url(), PHP_URL_HOST) ?: 'unknown-host';
    $ver = defined('DMN_PLUGIN_VERSION') ? DMN_BP_VER : 'dev';
    return "DMN-Booking-Plugin/{$ver} (+{$site})";
  }

  private function log_debug(string $tag, array $context): void
  {
    if (defined('WP_DEBUG') && WP_DEBUG) {
      error_log('[DMN ' . $tag . '] ' . wp_json_encode($context));
    }
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
