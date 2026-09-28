<?php
/**
 * Removes the analytics tables, their options and scheduled jobs when the plugin is deleted.
 * Venues, activities and connection settings are left in place.
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
  exit;
}

define('DMN_BP_DIR', plugin_dir_path(__FILE__));
require_once DMN_BP_DIR . 'src/php/Core/Database.php';

DMN\Booking\Core\Database::drop();
delete_option('dmn_bookings_sync');
delete_option('dmn_bookings_sync_lock');
delete_option('dmn_bookings_sync_generation');
delete_option('dmn_analytics_tracking');
delete_option('dmn_analytics_retention_days');
delete_transient('dmn_db_install_retry');
wp_clear_scheduled_hook('dmn_sync_bookings');

// Rate-limit counters from the widget events endpoint.
global $wpdb;
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '\\_transient\\_dmn\\_ev%' OR option_name LIKE '\\_transient\\_timeout\\_dmn\\_ev%'");
wp_clear_scheduled_hook('dmn_purge_analytics');
