<?php
/**
 * Plugin Name: DMN Booking Plugin
 * Description: DesignMyNight booking plugin with React + TypeScript (admin + widget).
 * Version: 2.5.1
 * Author: Carl Youngman
 * Email: me@carlyoungman
 */

if (!defined('ABSPATH')) {
  exit;
}

define('DMN_BP_VER', '2.5.1');
define('DMN_BP_DIR', plugin_dir_path(__FILE__));
define('DMN_BP_URL', plugin_dir_url(__FILE__));

require_once DMN_BP_DIR . 'src/php/Core/PostTypes.php';
require_once DMN_BP_DIR . 'src/php/Autoloader.php';


DMN\Booking\Autoloader::register();

use DMN\Booking\Config\Settings;
use DMN\Booking\PostTypes;


function dmn_bp_enqueue_widget_assets(): void
{
  static $enqueued = false;
  if ($enqueued) {
    return;
  }
  $enqueued = true;

  $asset = DMN_BP_DIR . 'dist/frontend/index.tsx.asset.php';
  if (!file_exists($asset)) {
    return;
  }

  $meta = include $asset;
  $deps = array_unique(array_merge($meta['dependencies'] ?? [], ['wp-api-fetch']));

  wp_enqueue_script(
    'dmn-widget',
    DMN_BP_URL . 'dist/frontend/index.tsx.js',
    $deps,
    $meta['version'] ?? filemtime(DMN_BP_DIR . 'dist/frontend/index.tsx.js'),
    true
  );

  wp_enqueue_style(
    'dmn-widget',
    DMN_BP_URL . 'dist/frontend/index.tsx.css',
    [],
    $meta['version'] ?? filemtime(DMN_BP_DIR . 'dist/frontend/index.tsx.css')
  );

  wp_localize_script('dmn-widget', 'DMN_PUBLIC_BOOT', [
    'restUrl' => esc_url_raw(rest_url('dmn/v1/')),
  ]);
}


// Registers the 'dmn_booking' shortcode to render the DMN booking widget with venue data.
add_action('init', function () {

  add_shortcode('dmn_booking', function ($atts = []) {
    dmn_bp_enqueue_widget_assets();
    $a = shortcode_atts([
      'venue_group' => get_option(Settings::OPT_VG, ''),
      'venue_id' => '',
      'type_id' => '',
      'allowed_days' => '',
      'url_params' => '',
    ], $atts, 'dmn_booking');

    // Base values from shortcode
    $venueGroup = $a['venue_group'];
    $venueId = $a['venue_id'];
    $typeId = $a['type_id'];
    $allowedDays = $a['allowed_days'];

    // Allow GET overrides
    if (isset($_GET['venue_group']) && $_GET['venue_group'] !== '') {
      $venueGroup = sanitize_text_field(wp_unslash($_GET['venue_group']));
    }

    if (isset($_GET['venue_id']) && $_GET['venue_id'] !== '') {
      $venueId = sanitize_text_field(wp_unslash($_GET['venue_id']));
    }

    if (isset($_GET['type_id']) && $_GET['type_id'] !== '') {
      // BUGFIX: this was incorrectly assigning to $venueId before
      $typeId = sanitize_text_field(wp_unslash($_GET['type_id']));
    }

    if (isset($_GET['allowed_days']) && $_GET['allowed_days'] !== '') {
      $allowedDays = sanitize_text_field(wp_unslash($_GET['allowed_days']));
    }

    /**
     * URL params
     */
    $globalRows = get_option('dmn_booking_url_params', []);
    $urlParamsAssoc = [];

    if (is_array($globalRows)) {
      foreach ($globalRows as $row) {
        if (!is_array($row)) {
          continue;
        }
        $name = isset($row['name']) ? (string)$row['name'] : '';
        $value = isset($row['value']) ? (string)$row['value'] : '';
        if ($name === '') {
          continue;
        }
        $urlParamsAssoc[$name] = $value;
      }
    }

    $urlParamsAttr = $a['url_params'];
    if (isset($_GET['url_params']) && $_GET['url_params'] !== '') {
      $urlParamsAttr = wp_unslash($_GET['url_params']);
    } elseif (isset($_GET['url-params']) && $_GET['url-params'] !== '') {
      $urlParamsAttr = wp_unslash($_GET['url-params']);
    }

    if (is_string($urlParamsAttr) && $urlParamsAttr !== '') {
      $inline = [];
      parse_str($urlParamsAttr, $inline);
      if (is_array($inline)) {
        foreach ($inline as $k => $v) {
          $k = sanitize_key($k);
          if ($k === '') {
            continue;
          }
          $urlParamsAssoc[$k] = sanitize_text_field((string)$v);
        }
      }
    }

    $dataUrlParams = $urlParamsAssoc ? wp_json_encode($urlParamsAssoc) : '';


    ob_start(); ?>
    <div class="dmn-widget-root"
         data-venue-group="<?php echo esc_attr($venueGroup); ?>"
         data-venue-id="<?php echo esc_attr($venueId); ?>"
         data-type-id="<?php echo esc_attr($typeId); ?>"
         data-allowed-days="<?php echo esc_attr($allowedDays); ?>"
      <?php if ($dataUrlParams) : ?>
        data-url-params="<?php echo esc_attr($dataUrlParams); ?>"
      <?php endif; ?>
    ></div>
    <?php
    return ob_get_clean();
  });
});


// Adds a top-level admin menu page for the DMN Booking plugin in the WordPress dashboard.
add_action('admin_menu', function () {
  add_menu_page(
    'DMN Booking',
    'DMN Booking',
    'manage_options',
    'dmn-booking-admin',
    function () {
      echo '<div class="wrap" ><h1 style="margin-bottom:1.5rem;">DesignMyNight – Admin</h1><div id="dmn-admin-root"></div></div>';
    },
    'dashicons-tickets', 58
  );
});
// Enqueues admin scripts and styles for the DMN Booking plugin only on the plugin's admin page, and localizes REST API data for JavaScript.
add_action('admin_enqueue_scripts', function ($hook) {
  if ($hook !== 'toplevel_page_dmn-booking-admin') {
    return;
  }

  $asset = DMN_BP_DIR . 'dist/admin/index.tsx.asset.php';
  if (!file_exists($asset)) {
    return;
  }

  $meta = include $asset;
  $deps = array_unique(array_merge($meta['dependencies'] ?? [], ['wp-api-fetch']));

  wp_enqueue_script(
    'dmn-admin',
    DMN_BP_URL . 'dist/admin/index.tsx.js',
    $deps,
    $meta['version'] ?? filemtime(DMN_BP_DIR . 'dist/admin/index.tsx.js'),
    true
  );

  wp_enqueue_style(
    'dmn-admin',
    DMN_BP_URL . 'dist/admin/index.tsx.css',
    [],
    $meta['version'] ?? filemtime(DMN_BP_DIR . 'dist/admin/index.tsx.css')
  );

  // Optional now that apiFetch is used; harmless if kept
  wp_localize_script('dmn-admin', 'DMN_ADMIN_BOOT', [
    'restUrl' => esc_url_raw(rest_url('dmn/v1/admin/')),
    'nonce' => wp_create_nonce('wp_rest'),
  ]);

  wp_enqueue_media();
});
// Enqueues frontend scripts and styles for the DMN Booking widget only on singular posts containing the 'dmn_booking' shortcode, and localizes REST API data for JavaScript.
add_action('wp_enqueue_scripts', function () {
  if (!is_singular()) {
    return;
  }
  global $post;
  if (!$post || !has_shortcode($post->post_content, 'dmn_booking')) {
    return;
  }

  $asset = DMN_BP_DIR . 'dist/frontend/index.tsx.asset.php';
  if (!file_exists($asset)) {
    return;
  }

  $meta = include $asset;
  $deps = array_unique(array_merge($meta['dependencies'] ?? [], ['wp-api-fetch']));

  wp_enqueue_script(
    'dmn-widget',
    DMN_BP_URL . 'dist/frontend/index.tsx.js',
    $deps,
    $meta['version'] ?? filemtime(DMN_BP_DIR . 'dist/frontend/index.tsx.js'),
    true
  );

  wp_enqueue_style(
    'dmn-widget',
    DMN_BP_URL . 'dist/frontend/index.tsx.css',
    [],
    $meta['version'] ?? filemtime(DMN_BP_DIR . 'dist/frontend/index.tsx.css')
  );

  wp_localize_script('dmn-widget', 'DMN_PUBLIC_BOOT', [
    'restUrl' => esc_url_raw(rest_url('dmn/v1/')),
  ]);
});

// Registers the custom post type for the DMN Booking plugin during the WordPress 'init' action.
add_action('init', [PostTypes::class, 'register']);
// Registers REST API routes for the DMN Booking plugin by initializing the admin and public controllers during the 'rest_api_init' action.
add_action('rest_api_init', function () {
  (new DMN\Booking\Rest\AdminController())->register_routes();
  (new DMN\Booking\Rest\PublicController())->register_routes();
});

