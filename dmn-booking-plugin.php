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
      echo '<div class="wrap"><h1>DesignMyNight – Admin</h1><div id="dmn-admin-root"></div></div>';
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
  wp_enqueue_media(); // <-- needed for wp.media
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

add_action('init', 'dmn_register_cpt_package');
add_action('init', 'dmn_register_package_meta');
add_action('rest_api_init', 'dmn_register_packages_routes');

/**
 * Register "Add-on Package" CPT.
 */
function dmn_register_cpt_package(): void
{
  register_post_type('dmn_package', [
    'label' => __('DMN Packages', 'dmn'),
    'public' => false,
    'show_ui' => true,
    'show_in_menu' => true,
    'supports' => ['title', 'editor', 'thumbnail'],
    'show_in_rest' => true, // enables wp/v2/dmn_package if you want it
    'capability_type' => 'post',
    'map_meta_cap' => true,
    'menu_icon' => 'dashicons-cart',
  ]);
}

/**
 * Registers custom meta fields for the DMN package post type.
 *
 * Defines meta fields for venue IDs, price text, visibility, and optional DMN package mapping.
 * These fields are exposed to the REST API for use in admin and public endpoints.
 *
 * @return void
 */
function dmn_register_package_meta(): void
{
// Array of **DMN venue IDs** this add-on applies to
  register_post_meta('dmn_package', '_dmn_pkg_venue_ids', [
    'show_in_rest' => ['schema' => ['type' => 'array', 'items' => ['type' => 'string']]],
    'single' => true,
    'type' => 'array',
    'auth_callback' => '__return_true',
  ]);


// Display price text (e.g. "£25 per person")
  register_post_meta('dmn_package', '_dmn_pkg_price_text', [
    'show_in_rest' => true,
    'single' => true,
    'type' => 'string',
    'auth_callback' => '__return_true',
  ]);


// Visible toggle (publish/draft is also used, but this allows soft-hiding)
  register_post_meta('dmn_package', '_dmn_pkg_visible', [
    'show_in_rest' => true,
    'single' => true,
    'type' => 'boolean',
    'auth_callback' => '__return_true',
  ]);


// Optional: native DMN package mapping for future syncs
  register_post_meta('dmn_package', '_dmn_pkg_dmn_id', [
    'show_in_rest' => true,
    'single' => true,
    'type' => 'string',
    'auth_callback' => '__return_true',
  ]);
}

/**
 * Registers REST API routes for DMN package management.
 *
 * Defines public and admin endpoints for listing, creating, updating, and deleting DMN package posts.
 * Public endpoint allows fetching visible packages by venue ID.
 * Admin endpoints allow CRUD operations, restricted to users with `manage_options` capability.
 *
 * @return void
 */
function dmn_register_packages_routes(): void
{
  register_rest_route('dmn/v1', '/packages', [
    [
      'methods' => WP_REST_Server::READABLE,
      'callback' => 'dmn_api_packages_get',
      'permission_callback' => '__return_true',
      'args' => [
        'venue_id' => ['type' => 'string', 'required' => false],
      ],
    ],
  ]);


// Admin CRUD endpoints
  register_rest_route('dmn/v1', '/admin/packages', [
    [
      'methods' => WP_REST_Server::READABLE,
      'callback' => 'dmn_api_packages_admin_list',
      'permission_callback' => function () {
        return current_user_can('manage_options');
      },
      'args' => [
        'venue_id' => ['type' => 'string', 'required' => false],
        'search' => ['type' => 'string', 'required' => false],
      ],
    ],
    [
      'methods' => WP_REST_Server::EDITABLE, // POST
      'callback' => 'dmn_api_packages_admin_bulk_save',
      'permission_callback' => function () {
        return current_user_can('manage_options');
      },
    ],
  ]);


  register_rest_route('dmn/v1', '/admin/packages/(?P<id>\d+)', [
    [
      'methods' => WP_REST_Server::DELETABLE,
      'callback' => 'dmn_api_packages_admin_delete',
      'permission_callback' => function () {
        return current_user_can('manage_options');
      },
    ],
  ]);
}

/**
 * Retrieves visible DMN package posts for the public API.
 *
 * Optionally filters by venue ID. Only published and visible packages are returned.
 *
 * @param WP_REST_Request $req The REST request containing an optional venue ID.
 * @return WP_REST_Response Response with the list of formatted package data.
 */
function dmn_api_packages_get(WP_REST_Request $req): WP_REST_Response
{
  $venue_id = sanitize_text_field((string)$req->get_param('venue_id'));
  $args = [
    'post_type' => 'dmn_package',
    'post_status' => 'publish',
    'posts_per_page' => 200,
    'no_found_rows' => true,
    'orderby' => 'menu_order title',
    'order' => 'ASC',
    'meta_query' => [
      'relation' => 'AND',
      ['key' => '_dmn_pkg_visible', 'compare' => 'NOT EXISTS'], // default visible if not set
    ],
  ];
  if ($venue_id) {
    $args['meta_query'][] = [
      'key' => '_dmn_pkg_venue_ids',
      'value' => '"' . $venue_id . '"',
      'compare' => 'LIKE',
    ];
  }
  $q = new WP_Query($args);
  $list = array_map('dmn_format_package', $q->posts);
  return new WP_REST_Response(['packages' => $list]);
}

/**
 * Retrieves a list of DMN package posts for the admin API.
 *
 * Supports optional filtering by venue ID and search term.
 *
 * @param WP_REST_Request $req The REST request containing optional filters.
 * @return WP_REST_Response Response with the list of formatted package data.
 */
function dmn_api_packages_admin_list(WP_REST_Request $req): WP_REST_Response
{
  $venue_id = sanitize_text_field((string)$req->get_param('venue_id'));
  $search = sanitize_text_field((string)$req->get_param('search'));
  $args = [
    'post_type' => 'dmn_package',
    'post_status' => ['publish', 'draft'],
    's' => $search ?: '',
    'posts_per_page' => 200,
    'no_found_rows' => true,
    'orderby' => 'date',
    'order' => 'DESC',
  ];
  if ($venue_id) {
    $args['meta_query'] = [
      [
        'key' => '_dmn_pkg_venue_ids',
        'value' => '"' . $venue_id . '"',
        'compare' => 'LIKE',
      ],
    ];
  }
  $q = new WP_Query($args);
  $list = array_map('dmn_format_package_admin', $q->posts);
  return new WP_REST_Response(['packages' => $list]);
}

/**
 * Bulk creates or updates DMN package posts via the admin REST API.
 *
 * Accepts an array of package data, updates existing posts or creates new ones,
 * updates relevant meta fields and featured image, and returns the updated packages.
 *
 * @param WP_REST_Request $req The REST request containing the packages array.
 * @return WP_REST_Response Response with the updated package data or error.
 */
function dmn_api_packages_admin_bulk_save(WP_REST_Request $req): WP_REST_Response
{
  $body = json_decode($req->get_body(), true);
  $items = is_array($body['packages'] ?? null) ? $body['packages'] : [];
  $updated = [];
  foreach ($items as $it) {
    $id = isset($it['id']) ? absint($it['id']) : 0;
    $title = sanitize_text_field($it['name'] ?? '');
    $content = wp_kses_post($it['description'] ?? '');
    $price_text = sanitize_text_field($it['priceText'] ?? '');
    $visible = !empty($it['visible']);
    $venue_ids = array_values(array_filter(array_map('sanitize_text_field', (array)($it['venueIds'] ?? []))));
    $image_id = isset($it['image_id']) ? absint($it['image_id']) : 0;


    $postarr = [
      'ID' => $id,
      'post_type' => 'dmn_package',
      'post_title' => $title ?: __('Untitled', 'dmn'),
      'post_content' => $content,
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


    update_post_meta($id, '_dmn_pkg_price_text', $price_text);
    update_post_meta($id, '_dmn_pkg_visible', (bool)$visible);
    update_post_meta($id, '_dmn_pkg_venue_ids', $venue_ids);
    if ($image_id) {
      set_post_thumbnail($id, $image_id);
    }
    $updated[] = dmn_format_package_admin(get_post($id));
  }
  return new WP_REST_Response(['packages' => $updated]);
}

/**
 * Deletes a DMN package post by ID via the admin REST API.
 *
 * @param WP_REST_Request $req The REST request containing the package ID.
 * @return WP_REST_Response Response indicating success or error.
 */
function dmn_api_packages_admin_delete(WP_REST_Request $req): WP_REST_Response
{
  $id = absint($req['id']);
  if (!$id) return new WP_REST_Response(['error' => 'Invalid ID'], 400);
  wp_delete_post($id, true);
  return new WP_REST_Response(['deleted' => $id]);
}


/**
 * Format a DMN package post for public API responses.
 *
 * @param WP_Post $p The package post object.
 * @return array Formatted package data for public use.
 */
function dmn_format_package(WP_Post $p): array
{
  $price = get_post_meta($p->ID, '_dmn_pkg_price_text', true);
  $visible = get_post_meta($p->ID, '_dmn_pkg_visible', true);
  $img = get_the_post_thumbnail_url($p, 'medium');
  return [
    'id' => (string)$p->ID,
    'name' => get_the_title($p),
    'description' => wp_strip_all_tags($p->post_content),
    'image_url' => $img ?: null,
    'priceText' => $price ?: null,
    'visible' => (bool)$visible,
  ];
}

/**
 * Format a DMN package post for admin API responses.
 *
 * @param WP_Post $p The package post object.
 * @return array Formatted package data for admin use.
 */
function dmn_format_package_admin(WP_Post $p): array
{
  $price = get_post_meta($p->ID, '_dmn_pkg_price_text', true);
  $visible = get_post_meta($p->ID, '_dmn_pkg_visible', true);
  $venue_ids = (array)get_post_meta($p->ID, '_dmn_pkg_venue_ids', true);
  $img_id = get_post_thumbnail_id($p);
  $img_url = $img_id ? wp_get_attachment_image_url($img_id, 'medium') : null;
  return [
    'id' => (int)$p->ID,
    'name' => get_the_title($p),
    'description' => $p->post_content,
    'image_id' => $img_id ?: null,
    'image_url' => $img_url,
    'priceText' => $price ?: null,
    'visible' => (bool)$visible,
    'venueIds' => array_values(array_map('strval', $venue_ids)),
  ];
}
