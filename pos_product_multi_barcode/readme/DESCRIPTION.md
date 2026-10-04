This module allows to use multiple barcode on a product from the PoS

See
<https://github.com/OCA/stock-logistics-barcode/tree/14.0/product_multi_barcode>

Barcode scanning is first resolved using the POS client-side indexed products. If not found, it falls back to a backend search via `pos.session.find_product_by_barcode`.
