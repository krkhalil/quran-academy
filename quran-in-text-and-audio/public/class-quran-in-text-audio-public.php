<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://dynamicweblab.com
 * @since      1.0.0
 *
 * @package    Quran_In_Text_Audio
 * @subpackage Quran_In_Text_Audio/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Quran_In_Text_Audio
 * @subpackage Quran_In_Text_Audio/public
 * @author     Dynamic Web Lab <dynamicweblab@gmail.com>
 */
class Quran_In_Text_Audio_Public {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

		add_shortcode( 'quran_full', [$this,'quran_full_callback']);
		add_shortcode( 'quran_surah', [$this,'quran_surah_callback']);
		add_shortcode( 'quran_ayah', [$this,'quran_ayah_callback']);

	}

	public function quran_full_callback($atts)
	{
		$active = '';
		
		ob_start();

		wp_enqueue_style($this->plugin_name);

		?>
		<div class="dwl-quran-area">
		<div class="dwl-quran-full-wrapper">
			<div class="dwl-quran-full--main">
				<?php
				for ($x = 1; $x <= 114; $x++) {
					//make first one active
					$active = ($x == 1) ? 'active' : '';
					echo '<div id="dwl-quran-surah-'.esc_attr($x).'" class="dwl-quran-surah dwl-quran-surah-'.esc_attr($x).' '.esc_attr($active).'" data-surah="'.esc_html($x).'">'.esc_html( 'تحميل...', 'quran-in-text-and-audio' ).'</div>';
				  }
				?>
			</div>
			<audio id="quran-audio-player" controls src=""></audio>
		</div>
		<div class="offacnvas-area" id="dwl-surah-offcanvas">
			<div class="offcanvas-content-wrap">
			<button class="dwl-surah-offcanvas-close" id="dwl-surah-offcanvas-close"><span></span><span></span></button>
			<div id="dwl-surah-listing"><?php esc_html_e( 'تحميل...', 'quran-in-text-and-audio' ) ?></div>	
		</div>
		</div>
	</div>
	<?php
	return ob_get_clean();
	}

	public function quran_surah_callback($atts)
	{
		$a = shortcode_atts( array(
			'surah' => '1',
			'random' => false,
		), $atts );

		$surah = $a['surah'];

		if($a['random']){
			$surah = wp_rand(1,114);
		}

		ob_start();
		
		wp_enqueue_style($this->plugin_name);

		?>

		<div class="dwl-quran-full-wrapper dwl-quran-single-surah-wrapper">
			<div class="dwl-quran-full--main">
				<div id="dwl-quran-surah-<?php echo esc_attr($surah); ?>" class="dwl-quran-surah dwl-quran-surah-<?php echo esc_attr($surah); ?> active" data-surah="<?php echo esc_html($surah); ?>"><?php esc_html_e( 'تحميل...', 'quran-in-text-and-audio' ) ?></div>
			</div>
			<audio id="quran-audio-player" controls src=""></audio>
		</div>
		<?php
		return ob_get_clean();
	}

	public function quran_ayah_callback($atts)
	{
		$a = shortcode_atts( array(
			'ayah' => '1',
			'random' => false,
		), $atts );

		$ayah = $a['ayah'];

		if($a['random']){
			$ayah = wp_rand(1,6236);
		}

		ob_start();
		
		wp_enqueue_style($this->plugin_name);

		echo '<div class="dwl-quran-full-wrapper"><div class="dwl-quran-ayah-wrapper dwl-quran-ayah-'.esc_attr($ayah).'" data-ayah="'.esc_html($ayah).'">'.esc_html( 'تحميل...', 'quran-in-text-and-audio' ).'</div></div>';
		
		return ob_get_clean();
	}
	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Quran_In_Text_Audio_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Quran_In_Text_Audio_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		 wp_register_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/quran-in-text-audio-public.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Quran_In_Text_Audio_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Quran_In_Text_Audio_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

	    $args = array( 
			'in_footer' => true,
			'strategy'  => 'defer',
		);

		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/quran-in-text-audio-public.js', array( ), $this->version , $args );

	}

}
