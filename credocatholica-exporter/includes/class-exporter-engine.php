<?php
if (!defined('ABSPATH')) {
    exit;
}

class CredoCatholica_Exporter_Engine {

    private $allowed_cpts = array(
        'cc_reading',
        'cc_saint',
        'cc_prayer',
        'cc_novena',
        'cc_catechism',
        'cc_season',
        'cc_reflection',
        'cc_document',
        'cc_formation'
    );

    private $allowed_taxonomies = array(
        'cc_liturgical_season',
        'cc_feast_rank',
        'cc_vocation',
        'cc_century',
        'cc_patronage',
        'cc_prayer_type',
        'cc_ccc_pillar',
        'cc_pathway'
    );

    private $referenced_media_ids = array();
    private $warnings = array();

    public function extract_all_data() {
        $posts_data = $this->extract_posts();
        $terms_data = $this->extract_terms();
        $term_taxonomy_data = $this->extract_term_taxonomy();
        $term_relationships_data = $this->extract_term_relationships();
        $postmeta_data = $this->extract_postmeta();
        $media_data = $this->extract_media();

        return array(
            'posts' => $posts_data,
            'postmeta' => $postmeta_data,
            'terms' => $terms_data,
            'termTaxonomy' => $term_taxonomy_data,
            'termRelationships' => $term_relationships_data,
            'media' => $media_data,
            'warnings' => $this->warnings,
        );
    }

    private function extract_posts() {
        $exported_posts = array();
        $batch_size = 100;

        foreach ($this->allowed_cpts as $cpt) {
            $paged = 1;
            do {
                $args = array(
                    'post_type' => $cpt,
                    'post_status' => array('publish', 'draft', 'pending', 'future', 'private'),
                    'posts_per_page' => $batch_size,
                    'paged' => $paged,
                    'orderby' => 'ID',
                    'order' => 'ASC',
                    'suppress_filters' => true,
                );

                $query_posts = get_posts($args);
                if (empty($query_posts)) {
                    break;
                }

                foreach ($query_posts as $post) {
                    $featured_id = get_post_thumbnail_id($post->ID);
                    if ($featured_id) {
                        $this->referenced_media_ids[] = (int)$featured_id;
                    }

                    $acf_fields = function_exists('get_fields') ? get_fields($post->ID) : array();
                    $normalized_acf = $this->normalize_acf_value($acf_fields, $post->ID);

                    $exported_posts[] = array(
                        'ID' => (int)$post->ID,
                        'post_type' => $post->post_type,
                        'post_title' => $post->post_title,
                        'post_name' => $post->post_name,
                        'post_content' => $post->post_content, // Faithful text extraction without rewriting
                        'post_excerpt' => $post->post_excerpt,
                        'post_status' => $post->post_status,
                        'post_date' => $post->post_date,
                        'post_modified' => $post->post_modified,
                        'guid' => $post->guid,
                        'featured_media_id' => $featured_id ? (int)$featured_id : null,
                        'acf' => $normalized_acf ? $normalized_acf : new stdClass(),
                    );
                }

                $paged++;
            } while (count($query_posts) === $batch_size);
        }

        return $exported_posts;
    }

    /**
     * Recursive ACF Value Normalizer
     */
    private function normalize_acf_value($value, $context_post_id = 0) {
        if (is_null($value) || $value === false) {
            return null;
        }

        if (is_scalar($value)) {
            return $value;
        }

        if (is_object($value)) {
            if ($value instanceof WP_Post) {
                return (int)$value->ID;
            }
            if ($value instanceof WP_Term) {
                return (int)$value->term_id;
            }
            // If image array or custom object converted to stdClass
            $val_array = (array)$value;
            if (isset($val_array['ID']) && isset($val_array['url'])) {
                $this->referenced_media_ids[] = (int)$val_array['ID'];
                return array(
                    'id' => (int)$val_array['ID'],
                    'url' => esc_url_raw($val_array['url']),
                    'alt' => isset($val_array['alt']) ? $val_array['alt'] : '',
                    'title' => isset($val_array['title']) ? $val_array['title'] : '',
                    'caption' => isset($val_array['caption']) ? $val_array['caption'] : '',
                    'mime_type' => isset($val_array['mime_type']) ? $val_array['mime_type'] : '',
                    'width' => isset($val_array['width']) ? (int)$val_array['width'] : null,
                    'height' => isset($val_array['height']) ? (int)$val_array['height'] : null,
                );
            }
            return $this->normalize_acf_value($val_array, $context_post_id);
        }

        if (is_array($value)) {
            // Check if ACF image array format
            if (isset($value['ID']) && isset($value['url'])) {
                $this->referenced_media_ids[] = (int)$value['ID'];
                return array(
                    'id' => (int)$value['ID'],
                    'url' => esc_url_raw($value['url']),
                    'alt' => isset($value['alt']) ? $value['alt'] : '',
                    'title' => isset($value['title']) ? $value['title'] : '',
                    'caption' => isset($value['caption']) ? $value['caption'] : '',
                    'mime_type' => isset($value['mime_type']) ? $value['mime_type'] : '',
                    'width' => isset($value['width']) ? (int)$value['width'] : null,
                    'height' => isset($value['height']) ? (int)$value['height'] : null,
                );
            }

            $normalized_list = array();
            $is_assoc = array_keys($value) !== range(0, count($value) - 1);

            foreach ($value as $k => $v) {
                $norm_item = $this->normalize_acf_value($v, $context_post_id);
                if ($is_assoc) {
                    $normalized_list[$k] = $norm_item;
                } else {
                    $normalized_list[] = $norm_item;
                }
            }
            return $normalized_list;
        }

        return null;
    }

    private function extract_terms() {
        $terms_list = get_terms(array(
            'taxonomy' => $this->allowed_taxonomies,
            'hide_empty' => false,
        ));

        $exported_terms = array();
        if (!is_wp_error($terms_list)) {
            foreach ($terms_list as $t) {
                $exported_terms[] = array(
                    'term_id' => (int)$t->term_id,
                    'name' => $t->name,
                    'slug' => $t->slug,
                );
            }
        }
        return $exported_terms;
    }

    private function extract_term_taxonomy() {
        global $wpdb;
        $taxonomies_placeholder = implode("','", array_map('esc_sql', $this->allowed_taxonomies));
        $query = "SELECT term_taxonomy_id, term_id, taxonomy, description, parent FROM {$wpdb->term_taxonomy} WHERE taxonomy IN ('{$taxonomies_placeholder}')";
        $results = $wpdb->get_results($query);

        $exported_tt = array();
        if ($results) {
            foreach ($results as $r) {
                $exported_tt[] = array(
                    'term_taxonomy_id' => (int)$r->term_taxonomy_id,
                    'term_id' => (int)$r->term_id,
                    'taxonomy' => $r->taxonomy,
                    'description' => $r->description,
                    'parent' => (int)$r->parent,
                );
            }
        }
        return $exported_tt;
    }

    private function extract_term_relationships() {
        global $wpdb;
        $cpts_placeholder = implode("','", array_map('esc_sql', $this->allowed_cpts));
        $taxonomies_placeholder = implode("','", array_map('esc_sql', $this->allowed_taxonomies));

        $query = "SELECT tr.object_id, tr.term_taxonomy_id 
                  FROM {$wpdb->term_relationships} tr 
                  INNER JOIN {$wpdb->posts} p ON tr.object_id = p.ID 
                  INNER JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id 
                  WHERE p.post_type IN ('{$cpts_placeholder}') 
                  AND tt.taxonomy IN ('{$taxonomies_placeholder}')";

        $results = $wpdb->get_results($query);

        $exported_tr = array();
        if ($results) {
            foreach ($results as $r) {
                $exported_tr[] = array(
                    'object_id' => (int)$r->object_id,
                    'term_taxonomy_id' => (int)$r->term_taxonomy_id,
                );
            }
        }
        return $exported_tr;
    }

    private function extract_postmeta() {
        // Minimal postmeta array per Rule 14
        return array();
    }

    private function extract_media() {
        $unique_media_ids = array_unique(array_filter($this->referenced_media_ids));
        $exported_media = array();

        foreach ($unique_media_ids as $attachment_id) {
            $post = get_post($attachment_id);
            if (!$post || $post->post_type !== 'attachment') {
                continue;
            }

            $url = wp_get_attachment_url($attachment_id);
            $meta = wp_get_attachment_metadata($attachment_id);
            $alt = get_post_meta($attachment_id, '_wp_attachment_image_alt', true);

            $exported_media[] = array(
                'attachment_id' => (int)$attachment_id,
                'url' => $url ? esc_url_raw($url) : '',
                'filename' => $url ? basename($url) : null,
                'mime_type' => $post->post_mime_type,
                'title' => $post->post_title,
                'caption' => $post->post_excerpt,
                'alt_text' => $alt ? $alt : '',
                'width' => isset($meta['width']) ? (int)$meta['width'] : null,
                'height' => isset($meta['height']) ? (int)$meta['height'] : null,
            );
        }

        return $exported_media;
    }
}
