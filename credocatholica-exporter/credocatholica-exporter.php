<?php
/**
 * Plugin Name: CredoCatholica Migration Exporter
 * Plugin URI: https://credocatholica.com
 * Description: Standalone temporary admin exporter utility for extracting normalized CredoCatholica content into the M0.4 JSON migration package contract.
 * Version: 1.0.0
 * Author: CredoCatholica Engineering Team
 * Text Domain: credocatholica-exporter
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

define('CREDOCATHOLICA_EXPORTER_VERSION', '1.0.0');
define('CREDOCATHOLICA_EXPORTER_PATH', plugin_dir_path(__FILE__));
define('CREDOCATHOLICA_EXPORTER_URL', plugin_dir_url(__FILE__));

require_once CREDOCATHOLICA_EXPORTER_PATH . 'includes/class-exporter-engine.php';
require_once CREDOCATHOLICA_EXPORTER_PATH . 'includes/class-exporter-zip.php';

class CredoCatholica_Exporter_Plugin {

    public function __construct() {
        add_action('admin_menu', array($this, 'register_admin_menu'));
        add_action('admin_post_credocatholica_export_download', array($this, 'handle_export_download'));
    }

    public function register_admin_menu() {
        add_management_page(
            __('CredoCatholica Migration Export', 'credocatholica-exporter'),
            __('CredoCatholica Export', 'credocatholica-exporter'),
            'manage_options',
            'credocatholica-exporter',
            array($this, 'render_admin_page')
        );
    }

    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('Unauthorized user capability.', 'credocatholica-exporter'));
        }

        $acf_active = function_exists('get_fields') || class_exists('ACF');
        ?>
        <div class="wrap">
            <h1><?php _e('CredoCatholica Content Migration Exporter', 'credocatholica-exporter'); ?></h1>
            <p><?php _e('Extracts normalized CredoCatholica Custom Post Types, taxonomies, ACF fields, and media references into a 7-file migration package ZIP.', 'credocatholica-exporter'); ?></p>

            <?php if (!$acf_active) : ?>
                <div class="notice notice-error">
                    <p><strong><?php _e('ERROR: Advanced Custom Fields (ACF) is not active.', 'credocatholica-exporter'); ?></strong> <?php _e('The migration exporter requires ACF to normalize content fields. Please activate ACF before exporting.', 'credocatholica-exporter'); ?></p>
                </div>
            <?php else : ?>
                <div class="card" style="max-width: 650px; padding: 20px; margin-top: 20px;">
                    <h2><?php _e('Export Scope Overview', 'credocatholica-exporter'); ?></h2>
                    <ul>
                        <li><strong><?php _e('Supported CPTs (9):', 'credocatholica-exporter'); ?></strong> <code>cc_reading</code>, <code>cc_saint</code>, <code>cc_prayer</code>, <code>cc_novena</code>, <code>cc_catechism</code>, <code>cc_season</code>, <code>cc_reflection</code>, <code>cc_document</code>, <code>cc_formation</code></li>
                        <li><strong><?php _e('Supported Taxonomies (8):', 'credocatholica-exporter'); ?></strong> <code>cc_liturgical_season</code>, <code>cc_feast_rank</code>, <code>cc_vocation</code>, <code>cc_century</code>, <code>cc_patronage</code>, <code>cc_prayer_type</code>, <code>cc_ccc_pillar</code>, <code>cc_pathway</code></li>
                        <li><strong><?php _e('Post Statuses:', 'credocatholica-exporter'); ?></strong> <code>publish</code>, <code>draft</code>, <code>pending</code>, <code>future</code>, <code>private</code></li>
                        <li><strong><?php _e('Package Output:', 'credocatholica-exporter'); ?></strong> 7 JSON files (<code>posts.json</code>, <code>postmeta.json</code>, <code>terms.json</code>, <code>term-taxonomy.json</code>, <code>term-relationships.json</code>, <code>media.json</code>, <code>manifest.json</code>) bundled into a secure ZIP download.</li>
                    </ul>

                    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                        <input type="hidden" name="action" value="credocatholica_export_download" />
                        <?php wp_nonce_field('credocatholica_export_action', 'credocatholica_export_nonce'); ?>
                        <p class="submit">
                            <input type="submit" name="submit" id="submit" class="button button-primary button-large" value="<?php _e('Generate & Download Migration Export ZIP', 'credocatholica-exporter'); ?>" />
                        </p>
                    </form>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }

    public function handle_export_download() {
        if (!current_user_can('manage_options')) {
            wp_die(__('Unauthorized user capability.', 'credocatholica-exporter'));
        }

        check_admin_referer('credocatholica_export_action', 'credocatholica_export_nonce');

        if (!function_exists('get_fields') && !class_exists('ACF')) {
            wp_die(__('ABORTING EXPORT: Advanced Custom Fields (ACF) is required but not active.', 'credocatholica-exporter'));
        }

        $engine = new CredoCatholica_Exporter_Engine();
        $package_data = $engine->extract_all_data();

        $packager = new CredoCatholica_Exporter_Zip();
        $zip_file_path = $packager->create_zip_package($package_data);

        if (is_wp_error($zip_file_path)) {
            wp_die($zip_file_path->get_error_message());
        }

        // Stream ZIP file safely via admin response
        $filename = basename($zip_file_path);
        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="' . esc_attr($filename) . '"');
        header('Content-Length: ' . filesize($zip_file_path));
        header('Pragma: no-cache');
        header('Expires: 0');

        readfile($zip_file_path);
        @unlink($zip_file_path); // Cleanup temporary file immediately after download
        exit;
    }
}

new CredoCatholica_Exporter_Plugin();
