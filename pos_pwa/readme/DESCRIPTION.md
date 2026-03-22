Progressive Web App (PWA) infrastructure for the Odoo Point of Sale.

Adds a Service Worker with scope `/pos` that caches static assets,
fonts, images, and the POS HTML shell for offline availability.
Includes a web manifest for installing the POS as a standalone app
on mobile devices and an offline fallback page.

Cache strategies:

- **Static assets** (`/web/assets/`, `/web/static/`, `/point_of_sale/static/`): stale-while-revalidate
- **Fonts/images**: cache-first with FIFO eviction (max 300 entries)
- **POS shell** (`/pos/ui`): network-first with 4s timeout, fallback to cache
- **RPC/API calls**: network-only (managed by PosData)
