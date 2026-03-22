1. Install the module (it depends on `pos_pwa` which will be auto-installed)
2. In **Point of Sale > Configuration > Settings**, the "Offline Mode"
   toggle is enabled by default
3. Open the POS at least once while online to populate the cache
4. The POS will now load and operate offline on subsequent visits

**Important**: The Odoo instance must have `DB_FILTER` configured
(e.g. `^mydb$`) for the PWA manifest and Service Worker routes to
work correctly with `auth='public'`.
