<?php

namespace DMN\Booking\Core;

/**
 * The plugin's own tables for booking analytics:
 * - `dmn_events`: anonymous booking widget events (opened, step completed, handed off to DMN).
 * - `dmn_bookings`: bookings copied from DesignMyNight by BookingSync, without customer details.
 */
class Database
{
  /** Bump when the schema changes; `maybe_upgrade()` then runs dbDelta again. */
  public const VERSION = '1';
  public const OPT_VERSION = 'dmn_db_version';

  public static function events_table(): string
  {
    global $wpdb;
    return $wpdb->prefix . 'dmn_events';
  }

  public static function bookings_table(): string
  {
    global $wpdb;
    return $wpdb->prefix . 'dmn_bookings';
  }

  /** Creates or updates the tables when the stored schema version is out of date. */
  public static function maybe_upgrade(): void
  {
    // After a failed attempt, wait before trying again rather than retrying on every request.
    if (get_option(self::OPT_VERSION) !== self::VERSION && !get_transient('dmn_db_install_retry')) {
      set_transient('dmn_db_install_retry', 1, HOUR_IN_SECONDS);
      self::install();
    }
  }

  public static function install(): void
  {
    global $wpdb;
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';

    $charset = $wpdb->get_charset_collate();
    $events = self::events_table();
    $bookings = self::bookings_table();

    // dbDelta needs two spaces after PRIMARY KEY and one field per line.
    dbDelta("CREATE TABLE $events (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  session_id char(32) NOT NULL,
  event varchar(16) NOT NULL,
  step varchar(16) DEFAULT NULL,
  venue_id varchar(64) DEFAULT NULL,
  type_id varchar(64) DEFAULT NULL,
  num_people smallint(5) unsigned DEFAULT NULL,
  created_at datetime NOT NULL,
  PRIMARY KEY  (id),
  KEY created_at (created_at),
  KEY venue_created (venue_id, created_at),
  KEY session_event (session_id, event)
) $charset;");

    dbDelta("CREATE TABLE $bookings (
  dmn_id varchar(64) NOT NULL,
  reference varchar(64) DEFAULT NULL,
  venue_id varchar(64) NOT NULL,
  type_id varchar(64) DEFAULT NULL,
  type_name varchar(191) DEFAULT NULL,
  booking_date date DEFAULT NULL,
  booking_time varchar(5) DEFAULT NULL,
  num_people smallint(5) unsigned NOT NULL DEFAULT 0,
  status varchar(32) NOT NULL DEFAULT '',
  source varchar(64) DEFAULT NULL,
  value decimal(12,2) DEFAULT NULL,
  deposit decimal(12,2) DEFAULT NULL,
  created_date datetime DEFAULT NULL,
  last_updated datetime DEFAULT NULL,
  synced_at datetime NOT NULL,
  PRIMARY KEY  (dmn_id),
  KEY booking_date (booking_date),
  KEY created_date (created_date),
  KEY venue_id (venue_id)
) $charset;");

    // Only recorded once both tables exist, so a failed attempt (for example missing CREATE
    // rights) is tried again on the next request instead of leaving Analytics silently empty.
    foreach ([$events, $bookings] as $table) {
      if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $wpdb->esc_like($table))) !== $table) {
        return;
      }
    }
    // Autoloaded: it is read on every request by maybe_upgrade().
    update_option(self::OPT_VERSION, self::VERSION, true);
    delete_transient('dmn_db_install_retry');
  }

  /** Removes the tables; used on uninstall. */
  public static function drop(): void
  {
    global $wpdb;
    $wpdb->query('DROP TABLE IF EXISTS ' . self::events_table());
    $wpdb->query('DROP TABLE IF EXISTS ' . self::bookings_table());
    delete_option(self::OPT_VERSION);
  }
}
