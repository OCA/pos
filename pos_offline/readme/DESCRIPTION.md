Full offline capability for the Odoo Point of Sale. Depends on `pos_pwa`.

When the POS is opened online, all data is cached in IndexedDB. On
subsequent visits without internet, the POS loads entirely from cache
and allows creating orders, processing cash payments, and printing
receipts. Orders are automatically synced when connectivity is restored.

Key features:

- **Offline startup**: Caches `load_data` response in IndexedDB, falls back
  to cache on network error with automatic IndexedDB readiness wait
- **Pending order persistence**: Pending order IDs are persisted to IndexedDB
  so they survive tab/browser closure
- **Exponential backoff retry**: Failed syncs are retried with backoff
  (1s to 60s), plus a 10s periodic safety-net check
- **Offline payments**: Payment terminal methods are hidden when offline;
  cash and manual methods remain available
- **Barcode fallback**: Barcode nomenclature fetch errors are caught
  gracefully (scanning disabled, POS still loads)
- **Rescue sessions**: Backend automatically creates rescue sessions for
  orders arriving after the original session was closed
- **Idempotent sync**: Duplicate orders (by UUID) are detected and skipped
