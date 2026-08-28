<?php
if (!defined('ABSPATH')) {
    exit;
}

class CredoCatholica_Exporter_Zip {

    public function create_zip_package($package_data) {
        $upload_dir = wp_upload_dir();
        $export_dir = path_join($upload_dir['basedir'], 'credocatholica-exports');

        if (!file_exists($export_dir)) {
            wp_mkdir_p($export_dir);
        }

        // Stale export cleanup (Rule 11)
        $this->cleanup_stale_exports($export_dir);

        $timestamp = date('Ymd-His');
        $zip_filename = "credocatholica-wordpress-export-{$timestamp}.zip";
        $zip_file_path = path_join($export_dir, $zip_filename);

        if (!class_exists('ZipArchive')) {
            return new WP_Error('zip_missing', __('ZipArchive PHP extension is not installed or enabled.', 'credocatholica-exporter'));
        }

        $zip = new ZipArchive();
        if ($zip->open($zip_file_path, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return new WP_Error('zip_create_failed', __('Failed to create ZIP archive.', 'credocatholica-exporter'));
        }

        $manifest = array(
            'formatVersion' => '1.0',
            'sourceSystem' => 'wordpress',
            'site' => get_bloginfo('name'),
            'exportedAt' => date('c'),
            'wordpressVersion' => get_bloginfo('version'),
            'acfVersion' => defined('ACF_VERSION') ? ACF_VERSION : 'unknown',
            'counts' => array(
                'posts' => count($package_data['posts']),
                'postmeta' => count($package_data['postmeta']),
                'terms' => count($package_data['terms']),
                'termTaxonomies' => count($package_data['termTaxonomy']),
                'termRelationships' => count($package_data['termRelationships']),
                'media' => count($package_data['media']),
            ),
            'validation' => array(
                'errors' => 0,
                'warnings' => count($package_data['warnings']),
            ),
        );

        $files_map = array(
            'posts.json' => $package_data['posts'],
            'postmeta.json' => $package_data['postmeta'],
            'terms.json' => $package_data['terms'],
            'term-taxonomy.json' => $package_data['termTaxonomy'],
            'term-relationships.json' => $package_data['termRelationships'],
            'media.json' => $package_data['media'],
            'manifest.json' => $manifest,
        );

        foreach ($files_map as $filename => $content) {
            $json_str = wp_json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            if ($json_str === false || json_last_error() !== JSON_ERROR_NONE) {
                $zip->close();
                @unlink($zip_file_path);
                return new WP_Error('json_encode_error', sprintf(__('JSON encoding failed for file %s: %s', 'credocatholica-exporter'), $filename, json_last_error_msg()));
            }
            $zip->addFromString($filename, $json_str);
        }

        $zip->close();

        return $zip_file_path;
    }

    private function cleanup_stale_exports($export_dir) {
        $files = glob(path_join($export_dir, 'credocatholica-wordpress-export-*.zip'));
        if ($files) {
            foreach ($files as $file) {
                if (is_file($file)) {
                    @unlink($file);
                }
            }
        }
    }
}
