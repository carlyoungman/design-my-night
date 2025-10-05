<?php
/**
 * Registers all custom post types + REST-exposed meta we use for DMN.
 */

namespace DMN\Booking;

class PostTypes
{
  /**
   * I register the CPTs on init.
   */
  public static function register(): void
  {
    // ---- Venues (synced from DMN) ----
    register_post_type('dmn_venue', [
      'labels' => [
        'name' => 'DMN Venues',
        'singular_name' => 'DMN Venue',
      ],
      'public' => false,
      'show_ui' => false,
      'show_in_menu' => true,
      'show_in_rest' => true,
      'has_archive' => false,
      'hierarchical' => false,
      'supports' => ['title', 'custom-fields'],
      'menu_icon' => 'dashicons-location',
      'map_meta_cap' => true,
      'rewrite' => false,
    ]);

    // ---- Activities / Booking types
    register_post_type('dmn_activity', [
      'labels' => [
        'name' => 'DMN Activities',
        'singular_name' => 'DMN Activity',
      ],
      'public' => false,
      'show_ui' => false,
      'show_in_menu' => true,
      'show_in_rest' => true,
      'has_archive' => false,
      'hierarchical' => false,
      'supports' => ['title', 'custom-fields'],
      'menu_icon' => 'dashicons-forms',
      'map_meta_cap' => true,
      'rewrite' => false,
    ]);

    // ---- Menus (preorder menus) ----
    register_post_type('dmn_menu', [
      'labels' => [
        'name' => 'DMN Menus',
        'singular_name' => 'DMN Menu',
      ],
      'public' => false,
      'show_ui' => false,
      'show_in_rest' => true,
      'has_archive' => false,
      'hierarchical' => false,
      'supports' => ['title', 'editor', 'custom-fields'],
      'menu_icon' => 'dashicons-list-view',
      'map_meta_cap' => true,
      'rewrite' => false,
    ]);

    // ---- Menu Items (items inside a preorder menu) ----
    register_post_type('dmn_menu_item', [
      'labels' => [
        'name' => 'DMN Menu Items',
        'singular_name' => 'DMN Menu Item',
      ],
      'public' => false,
      'show_ui' => false,
      'show_in_rest' => true,
      'has_archive' => false,
      'hierarchical' => false,
      'supports' => ['title', 'editor', 'custom-fields'],
      'menu_icon' => 'dashicons-buddicons-replies',
      'map_meta_cap' => true,
      'rewrite' => false,
    ]);

    self::register_meta();
  }

  /**
   * Register the meta fields I need available via REST for the React UIs and sync jobs.
   */
  private static function register_meta(): void
  {
    // Venues
    self::meta('dmn_venue', 'dmn_id', 'integer');
    self::meta('dmn_venue', 'dmn_path', 'string');
    self::meta('dmn_venue', 'dmn_return_url', 'string');
    self::meta('dmn_venue', 'is_active', 'boolean');

    // Activities
    self::meta('dmn_activity', 'venue_id', 'integer');
    self::meta('dmn_activity', 'slug', 'string');
    self::meta('dmn_activity', 'preorder_menu_id', 'integer');

    // Menus
    self::meta('dmn_menu', 'venue_id', 'integer');

    // Menu Items
    self::meta('dmn_menu_item', 'menu_id', 'integer');
    self::meta('dmn_menu_item', 'price', 'number');
    self::meta('dmn_menu_item', 'sku', 'string');
  }

  /**
   * Small helper so I don't repeat the register_post_meta boilerplate.
   */
  private static function meta(string $post_type, string $key, string $type): void
  {
    register_post_meta($post_type, $key, [
      'type' => $type,
      'single' => true,
      'show_in_rest' => true,
      'auth_callback' => function () {
        return current_user_can('edit_posts');
      },
    ]);
  }
}
