
[![Runboat](https://img.shields.io/badge/runboat-Try%20me-875A7B.png)](https://runboat.odoo-community.org/builds?repo=OCA/pos&target_branch=15.0)
[![Pre-commit Status](https://github.com/OCA/pos/actions/workflows/pre-commit.yml/badge.svg?branch=15.0)](https://github.com/OCA/pos/actions/workflows/pre-commit.yml?query=branch%3A15.0)
[![Build Status](https://github.com/OCA/pos/actions/workflows/test.yml/badge.svg?branch=15.0)](https://github.com/OCA/pos/actions/workflows/test.yml?query=branch%3A15.0)
[![codecov](https://codecov.io/gh/OCA/pos/branch/15.0/graph/badge.svg)](https://codecov.io/gh/OCA/pos)
[![Translation Status](https://translation.odoo-community.org/widgets/pos-15-0/-/svg-badge.svg)](https://translation.odoo-community.org/engage/pos-15-0/?utm_source=widget)

<!-- /!\ do not modify above this line -->

# Point of Sale

Odoo modules for Point of Sale.

<!-- /!\ do not modify below this line -->

<!-- prettier-ignore-start -->

[//]: # (addons)

Available addons
----------------
addon | version | maintainers | summary
--- | --- | --- | ---
[pos_cash_move_reason](pos_cash_move_reason/) | 15.0.1.0.0 |  | POS cash in-out reason
[pos_event_sale](pos_event_sale/) | 15.0.1.0.3 | [![ivantodorovich](https://github.com/ivantodorovich.png?size=30px)](https://github.com/ivantodorovich) | Sell events from Point of Sale
[pos_event_sale_registration_qr_code](pos_event_sale_registration_qr_code/) | 15.0.1.0.0 | [![ivantodorovich](https://github.com/ivantodorovich.png?size=30px)](https://github.com/ivantodorovich) | Print registration QR codes on Point of Sale receipts
[pos_event_sale_session](pos_event_sale_session/) | 15.0.1.0.1 | [![ivantodorovich](https://github.com/ivantodorovich.png?size=30px)](https://github.com/ivantodorovich) | Sell event sessions from Point of Sale
[pos_hide_cost_price_and_margin](pos_hide_cost_price_and_margin/) | 15.0.1.0.1 |  | Hide Cost and Margin on PoS
[pos_lot_barcode](pos_lot_barcode/) | 15.0.1.0.0 |  | Scan barcode to enter lot/serial numbers
[pos_lot_selection](pos_lot_selection/) | 15.0.1.0.1 |  | POS Lot Selection
[pos_payment_change](pos_payment_change/) | 15.0.1.0.0 | [![legalsylvain](https://github.com/legalsylvain.png?size=30px)](https://github.com/legalsylvain) | Allow cashier to change order payments, as long as the session is not closed.
[pos_product_display_default_code](pos_product_display_default_code/) | 15.0.1.0.0 |  | pos: display product default code before product name
[pos_receipt_hide_price](pos_receipt_hide_price/) | 15.0.1.0.0 |  | Add button to remove price from receipt.
[pos_report_session_summary](pos_report_session_summary/) | 15.0.1.0.0 |  | Adds a Session Summary PDF report on the POS session
[pos_sale_pos_event_sale](pos_sale_pos_event_sale/) | 15.0.1.0.0 | [![ivantodorovich](https://github.com/ivantodorovich.png?size=30px)](https://github.com/ivantodorovich) | Glue module between pos_sale and pos_event_sale
[pos_sale_pos_event_sale_session](pos_sale_pos_event_sale_session/) | 15.0.1.0.0 | [![ivantodorovich](https://github.com/ivantodorovich.png?size=30px)](https://github.com/ivantodorovich) | Glue module between pos_sale and pos_event_sale_session
[pos_supplierinfo_barcode](pos_supplierinfo_barcode/) | 15.0.1.0.0 | [![eLBati](https://github.com/eLBati.png?size=30px)](https://github.com/eLBati) | Search products by supplier barcode
[pos_supplierinfo_search](pos_supplierinfo_search/) | 15.0.1.0.0 | [![eLBati](https://github.com/eLBati.png?size=30px)](https://github.com/eLBati) | Search products by supplier data

[//]: # (end addons)

<!-- prettier-ignore-end -->

## Licenses

This repository is licensed under [AGPL-3.0](LICENSE).

However, each module can have a totally different license, as long as they adhere to Odoo Community Association (OCA)
policy. Consult each module's `__manifest__.py` file, which contains a `license` key
that explains its license.

----
OCA, or the [Odoo Community Association](http://odoo-community.org/), is a nonprofit
organization whose mission is to support the collaborative development of Odoo features
and promote its widespread use.
