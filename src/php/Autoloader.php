<?php

namespace DMN\Booking;

class Autoloader {
  public static function register(): void {
    spl_autoload_register( function ( $class ) {
      if ( ! str_starts_with( $class, __NAMESPACE__ . '\\' ) ) {
        return;
      }
      $rel  = str_replace( __NAMESPACE__ . '\\', '', $class );
      $path = DMN_BP_DIR . 'src/php/' . str_replace( '\\', '/', $rel ) . '.php';
      if ( file_exists( $path ) ) {
        require_once $path;
      }
    } );
  }
}
