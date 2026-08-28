# CredoCatholica WordPress Exporter Plugin

## Overview

The **CredoCatholica Migration Exporter** is a standalone, temporary WordPress admin plugin designed to extract and normalize CredoCatholica content from WordPress into the 7-file JSON export package required by the Next.js migration pipeline.

---

## 1. Installation Instructions

1. Copy or upload the `credocatholica-exporter/` directory into your WordPress plugins folder:
   `wp-content/plugins/credocatholica-exporter/`
2. Log into the WordPress Admin Dashboard.
3. Go to **Plugins -> Installed Plugins**.
4. Locate **CredoCatholica Migration Exporter** and click **Activate**.

---

## 2. Usage Instructions

1. Ensure **Advanced Custom Fields (ACF)** plugin is active.
2. In the WordPress Admin menu, navigate to **Tools -> CredoCatholica Export**.
3. Review the export scope metrics and click **Generate & Download Migration Export ZIP**.
4. Save the generated `credocatholica-wordpress-export-YYYYMMDD-HHMMSS.zip` file to your local computer.

---

## 3. Extracting into Next.js Migration Pipeline

1. Extract the contents of the generated ZIP file.
2. Copy the 6 migration JSON files (`posts.json`, `postmeta.json`, `terms.json`, `term-taxonomy.json`, `term-relationships.json`, `media.json`) into the Next.js repository input directory:
   `scripts/wordpress-migration/input/`
3. Execute the offline dry-run migration pipeline command:
   ```bash
   pnpm migration:wp
   ```
4. Review the generated reconciliation report under `scripts/wordpress-migration/reports/`.

---

## 4. Deactivation & Cleanup

Once data extraction is complete and verified:
1. Deactivate and delete the **CredoCatholica Migration Exporter** plugin.
2. Temporary export ZIP files in `wp-content/uploads/credocatholica-exports/` are cleaned up automatically upon generating new exports or deleting the plugin.
