<?php
/**
 * Plugin Name: DMN Booking Plugin
 * Description: DesignMyNight booking plugin with React + TypeScript (admin + widget).
 * Version: 0.1.0
 * Author: Carl Youngman
 */

use DMN\Booking\Config\Settings;

if (!defined('ABSPATH')) {
  exit;
}

define('DMN_BP_VER', '0.1.0');
define('DMN_BP_DIR', plugin_dir_path(__FILE__));
define('DMN_BP_URL', plugin_dir_url(__FILE__));

require_once DMN_BP_DIR . 'src/php/Autoloader.php';
DMN\Booking\Autoloader::register();

add_action('init', function () {
  // Shortcode renders the public widget root
  add_shortcode('dmn_booking', function (array $atts = []) {
    $atts = shortcode_atts([
      'venue_group' => get_option(Settings::OPT_VG, ''),
      'venue_id' => ''
    ], $atts, 'dmn_booking');

    ob_start(); ?>
    <div class="dmn-widget-root"
         data-venue-group="<?php echo esc_attr($atts['venue_group']); ?>"
         data-venue-id="<?php echo esc_attr($atts['venue_id']); ?>"></div>
    <?php
    return ob_get_clean();
  });
});

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

// Admin enqueue
add_action('admin_enqueue_scripts', function ($hook) {

  if ($hook !== 'toplevel_page_dmn-booking-admin') {
    return;
  }
  $asset = DMN_BP_DIR . 'dist/admin/index.ts.asset.php';
  if (!file_exists($asset)) {
    return;
  }

  $meta = include $asset;
  wp_enqueue_script('dmn-admin', DMN_BP_URL . 'dist/admin/index.ts.js', $meta['dependencies'], $meta['version'], true);
  wp_enqueue_style('dmn-admin', DMN_BP_URL . 'dist/admin/index.ts.css', [], $meta['version']);

  wp_localize_script('dmn-admin', 'DMN_ADMIN_BOOT', [
    'restUrl' => esc_url_raw(rest_url('dmn/v1/admin/')),
    'nonce' => wp_create_nonce('wp_rest'),
  ]);
  wp_enqueue_media();
});


// Frontend enqueue (only on pages with shortcode)
add_action('wp_enqueue_scripts', function () {
  if (!is_singular()) {
    return;
  }
  global $post;
  if (!$post || !has_shortcode($post->post_content, 'dmn_booking')) {
    return;
  }

  $asset = DMN_BP_DIR . 'dist/frontend/index.ts.asset.php';
  if (!file_exists($asset)) {
    return;
  }
  $meta = include $asset;

  wp_enqueue_script('dmn-widget', DMN_BP_URL . 'dist/frontend/index.ts.js', $meta['dependencies'], $meta['version'], true);
  wp_enqueue_style('dmn-widget', DMN_BP_URL . 'dist/frontend/index.ts.css', [], $meta['version']);

  wp_localize_script('dmn-widget', 'DMN_PUBLIC_BOOT', [
    'restUrl' => esc_url_raw(rest_url('dmn/v1/')),
  ]);
});


add_action('rest_api_init', function () {
  (new DMN\Booking\Rest\AdminController())->register_routes();
  (new DMN\Booking\Rest\PublicController())->register_routes();
});

