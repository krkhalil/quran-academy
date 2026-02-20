=== Quran in Text and Audio ===
Contributors: maidulcu
Donate link: https://dynamicweblab.com
Tags: Quran, Surah, Ayah, Full Quran, Islamic audio, Quran translation, Arabic recitation, Holy Quran
Requires at least: 3.0.1
Tested up to: 6.8.2
Requires PHP: 7.0
Stable tag: 1.0.9
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Display the full Quran or specific verses with high-quality audio, translations, and interactive reading features.

== Description ==

[Quran Demo](https://demo.dynamicweblab.com/quran-in-text-and-audio-demo/)

The **Quran in Text and Audio** plugin lets you **read the Quran online** and **listen to high-quality Quran recitations** directly on your WordPress site. Display the Holy Quran in beautiful Arabic script with clear ayah numbering, offer **authentic Quran translations** in multiple languages, and provide an **Islamic audio player** for seamless playback. Ideal for mosques, Islamic schools, or personal blogs, this plugin makes it easy for visitors to **listen to the Quran**, follow along with the text, and enjoy a deeply spiritual experience wherever they are.


Features:
* Display the full Quran with translation and audio controls
* Show a single Surah or a random Surah
* Show a single Ayah or a random Ayah
* Built-in audio player with sticky footer controls
* Bookmark feature for saving favorite ayahs
* Responsive, mobile-friendly design
* Arabic typography with clear ayah numbering

== Shortcodes ==

Shortcodes allow you to easily embed Quranic content—such as the full Quran, a specific Surah, or a single Ayah—directly into your WordPress posts, pages, or widgets. Just copy and paste the desired shortcode into your content editor.

### Full Quran
Display the entire Quran with translation and audio controls:

    [quran_full]

### Specific Surah
Display a single Surah by specifying its number (replace `1` with any Surah number):


    [quran_surah surah=1]


### Random Surah
Show a random Surah each time the page loads:


    [quran_surah random=true]


### Specific Ayah
Display a single Ayah by specifying its number (replace `1` with any Ayah number):


    [quran_ayah ayah=1]


### Random Ayah
Show a random Ayah each time the page loads:


    [quran_ayah random=true]


**Note:** You can customize attributes such as `surah` and `ayah` in the shortcodes above to display specific content. The Quran contains 6236 verses in total.

== Installation ==

INSTALL WITHIN WORDPRESS


1. Visit the plugins page within your dashboard and select ‘Add New’
2. Search for "Quran in Text and Audio"
3. Activate "Quran in Text and Audio" from your Plugins page


INSTALL MANUALLY

1. Upload `quran-in-text-audio` to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress

== Screenshots ==

1. Full Quran view with audio and translations
2. Single Surah display
3. Single Ayah with play and bookmark buttons
4. Sticky footer audio player

== Changelog ==

= 1.0.9 =
* Improved Surah sidebar UI layout with new design
* Added Arabic Surah names to list
* Enhanced typography and alignment for better readability
* Fixed layout issue with long English Surah titles

= 1.0.8 =
* Updated css for ayat

= 1.0.7 =
* Added bookmark feature for individual ayahs with persistent storage in localStorage
* Improved CSS styling for ayah number and bookmark icons for better visual alignment
* Applied Arabic font to ayah numbers for consistent typography
* Cleaned up JavaScript code for improved maintainability and performance
* Removed inline CSS and moved styles to external stylesheet
* Enhanced mobile responsiveness and spacing for better user experience

= 1.0.6 =
* Improve Audio play button, its go next one now
* Added Sticky footer player bar

= 1.0.5 =
* Added quota-safe localStorage caching with TTL for surahs and ayahs
* Implemented background prefetching of nearby surahs for faster navigation
* Prefetches initial surahs in idle time after surah list load
* Falls back gracefully if localStorage quota is exceeded
* Optimized caching logic to reduce API calls while keeping content fresh
* Maintained compatibility with existing API endpoints and frontend behavior

= 1.0.4 =
* Improved frontend JS: added fetch retry with timeout and graceful error messages
* Escaped all dynamic HTML from API for XSS protection
* Added ARIA labels and keyboard navigation for accessibility
* Enhanced click handling to support nested elements inside buttons
* Added loading indicators for ayahs and surahs
* Maintained backwards compatibility with previous HTML structure

= 1.0.3 =
* Fix surah scroll bug
* On select surah close sidebar menu

= 1.0.2 =
* Tested upto 6.6.2
* Conditionally load css

= 1.0.1 =
* Update text domain
* Conditionally load css
* Small css color fix
* Replace native php function with wordpress one

= 1.0.0 =
* Initial Release

== Upgrade Notice ==
1.0.7 - Added bookmarks, improved styling, applied Arabic font to ayah numbers, cleaned JavaScript, removed inline CSS, and enhanced mobile responsiveness.

== Privacy & Terms ==
This plugin retrieves Quran text, audio, and translation data from the official public API at [https://alquran.cloud/api](https://alquran.cloud/api).

No personal data from your WordPress site visitors is collected or stored by this plugin.

Terms and Conditions: [https://alquran.cloud/terms-and-conditions](https://alquran.cloud/terms-and-conditions)