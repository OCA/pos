
[![Runboat](https://img.shields.io/badge/runboat-Try%20me-875A7B.png)](https://runboat.odoo-community.org/builds?repo=OCA/pos&target_branch=11.0)
[![Pre-commit Status](https://github.com/OCA/pos/actions/workflows/pre-commit.yml/badge.svg?branch=11.0)](https://github.com/OCA/pos/actions/workflows/pre-commit.yml?query=branch%3A11.0)
[![Build Status](https://github.com/OCA/pos/actions/workflows/test.yml/badge.svg?branch=11.0)](https://github.com/OCA/pos/actions/workflows/test.yml?query=branch%3A11.0)
[![codecov](https://codecov.io/gh/OCA/pos/branch/11.0/graph/badge.svg)](https://codecov.io/gh/OCA/pos)
[![Translation Status](https://translation.odoo-community.org/widgets/pos-11-0/-/svg-badge.svg)](https://translation.odoo-community.org/engage/pos-11-0/?utm_source=widget)

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
[pos_cashier_login](pos_cashier_login/) | 11.0.0.1.2 | [![kirca](https://github.com/kirca.png?size=30px)](https://github.com/kirca) | Require for cashier to sign in before each sale
[pos_config_show_accounting](pos_config_show_accounting/) | 11.0.1.0.0 |  | Always display accounting settings in POS Config
[pos_default_payment_method](pos_default_payment_method/) | 11.0.1.0.1 |  | POS Default payment method
[pos_fix_search_limit](pos_fix_search_limit/) | 11.0.1.0.1 |  | Increase search in the PoS
[pos_lot_selection](pos_lot_selection/) | 11.0.1.0.0 |  | POS Lot Selection
[pos_loyalty](pos_loyalty/) | 11.0.1.0.1 |  | Loyalty Program
[pos_margin](pos_margin/) | 11.0.1.0.1 |  | Margin on PoS Order
[pos_order_mgmt](pos_order_mgmt/) | 11.0.1.0.4 |  | Manage old POS Orders from the frontend
[pos_order_return](pos_order_return/) | 11.0.1.0.1 |  | Point of Sale Order Return
[pos_payment_change](pos_payment_change/) | 11.0.1.0.0 | [![legalsylvain](https://github.com/legalsylvain.png?size=30px)](https://github.com/legalsylvain) | Allow cashier to change order payments, as long as the session is not closed.
[pos_payment_entries_globalization](pos_payment_entries_globalization/) | 11.0.1.0.1 |  | Globalize POS Payment
[pos_picking_delayed](pos_picking_delayed/) | 11.0.1.0.1 | [![legalsylvain](https://github.com/legalsylvain.png?size=30px)](https://github.com/legalsylvain) [![chienandalu](https://github.com/chienandalu.png?size=30px)](https://github.com/chienandalu) | Delay the creation of the picking when PoS order is created
[pos_price_to_weight](pos_price_to_weight/) | 11.0.1.0.1 |  | Compute weight based on barcodes with prices
[pos_session_pay_invoice](pos_session_pay_invoice/) | 11.0.1.0.1 |  | Pay and receive invoices from PoS Session
[pos_stock_picking_invoice_link](pos_stock_picking_invoice_link/) | 11.0.1.0.0 |  | POS Stock Picking Invoice Link
[pos_ticket_logo](pos_ticket_logo/) | 11.0.1.0.0 |  | Pos Ticket Logo

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
