<?php

/**
 * Define the internationalization functionality
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @link       https://dynamicweblab.com
 * @since      1.0.0
 *
 * @package    Quran_In_Text_Audio
 * @subpackage Quran_In_Text_Audio/includes
 */

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      1.0.0
 * @package    Quran_In_Text_Audio
 * @subpackage Quran_In_Text_Audio/includes
 * @author     Dynamic Web Lab <dynamicweblab@gmail.com>
 */
class Quran_In_Text_Audio_i18n {


	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    1.0.0
	 */
	public function load_plugin_textdomain() {

		load_plugin_textdomain(
			'quran-in-text-audio',
			false,
			dirname( dirname( plugin_basename( __FILE__ ) ) ) . '/languages/'
		);

	}



}
