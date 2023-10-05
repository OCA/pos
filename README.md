
[![Runboat](https://img.shields.io/badge/runboat-Try%20me-875A7B.png)](https://runboat.odoo-community.org/builds?repo=OCA/pos&target_branch=13.0)
[![Pre-commit Status](https://github.com/OCA/pos/actions/workflows/pre-commit.yml/badge.svg?branch=13.0)](https://github.com/OCA/pos/actions/workflows/pre-commit.yml?query=branch%3A13.0)
[![Build Status](https://github.com/OCA/pos/actions/workflows/test.yml/badge.svg?branch=13.0)](https://github.com/OCA/pos/actions/workflows/test.yml?query=branch%3A13.0)
[![codecov](https://codecov.io/gh/OCA/pos/branch/13.0/graph/badge.svg)](https://codecov.io/gh/OCA/pos)
[![Translation Status](https://translation.odoo-community.org/widgets/pos-13-0/-/svg-badge.svg)](https://translation.odoo-community.org/engage/pos-13-0/?utm_source=widget)

<!-- /!\ do not modify above this line -->

# Point of Sale

This project aims to deal with Odoo modules related to the Point of Sale.

<!-- /!\ do not modify below this line -->

<!-- prettier-ignore-start -->

[//]: # (addons)

Available addons
----------------
addon | version | maintainers | summary
--- | --- | --- | ---
[pos_customer_required](pos_customer_required/) | 13.0.1.0.0 |  | Point of Sale Require Customer
[pos_default_partner](pos_default_partner/) | 13.0.1.0.1 |  | Add a default customer in pos order
[pos_empty_home](pos_empty_home/) | 13.0.1.1.0 |  | Point of Sale - Hide products if no category is selected
[pos_event_sale](pos_event_sale/) | 13.0.1.0.1 | [![ivantodorovich](https://github.com/ivantodorovich.png?size=30px)](https://github.com/ivantodorovich) | Sell events from Point of Sale
[pos_fix_search_limit](pos_fix_search_limit/) | 13.0.1.0.2 |  | Increase search in the PoS
[pos_fixed_discount](pos_fixed_discount/) | 13.0.1.0.1 | [![eLBati](https://github.com/eLBati.png?size=30px)](https://github.com/eLBati) | Allow to apply discounts with fixed amount
[pos_invoice_required](pos_invoice_required/) | 13.0.1.0.1 | [![robyf70](https://github.com/robyf70.png?size=30px)](https://github.com/robyf70) | Point of Sale Require Invoice
[pos_margin](pos_margin/) | 13.0.2.0.2 | [![legalsylvain](https://github.com/legalsylvain.png?size=30px)](https://github.com/legalsylvain) | Margin on PoS Order
[pos_order_mgmt](pos_order_mgmt/) | 13.0.1.1.0 |  | Manage old POS Orders from the frontend
[pos_order_remove_line](pos_order_remove_line/) | 13.0.1.1.1 | [![robyf70](https://github.com/robyf70.png?size=30px)](https://github.com/robyf70) | Add button to remove POS order line.
[pos_order_to_sale_order](pos_order_to_sale_order/) | 13.0.1.0.3 | [![legalsylvain](https://github.com/legalsylvain.png?size=30px)](https://github.com/legalsylvain) | PoS Order To Sale Order
[pos_partner_lang](pos_partner_lang/) | 13.0.1.0.1 | [![ivantodorovich](https://github.com/ivantodorovich.png?size=30px)](https://github.com/ivantodorovich) | Allows to view and edit the partner language.
[pos_payment_method_image](pos_payment_method_image/) | 13.0.1.0.2 |  | Add images on Payment Method available in the PoS
[pos_payment_terminal](pos_payment_terminal/) | 13.0.1.1.0 |  | Point of sale: support generic payment terminal
[pos_picking_delayed](pos_picking_delayed/) | 13.0.1.0.1 | [![legalsylvain](https://github.com/legalsylvain.png?size=30px)](https://github.com/legalsylvain) | Delay the creation of the picking when PoS order is created
[pos_product_sort](pos_product_sort/) | 13.0.1.0.1 |  | sort the products by name in the point of sale instead of sorting them by the sequence field.
[pos_quick_logout](pos_quick_logout/) | 13.0.1.0.0 |  | Allow PoS user to logout quickly after user changed
[pos_report_session_summary](pos_report_session_summary/) | 13.0.1.0.0 |  | Adds a Session Summary PDF report on the POS session
[pos_session_pay_invoice](pos_session_pay_invoice/) | 13.0.1.0.0 |  | Pay and receive invoices from PoS Session
[pos_stock_picking_invoice_link](pos_stock_picking_invoice_link/) | 13.0.1.0.0 |  | POS Stock Picking Invoice Link
[pos_timeout](pos_timeout/) | 13.0.1.0.2 |  | Set the timeout of the point of sale
[pos_user_restriction](pos_user_restriction/) | 13.0.1.0.0 | [![eLBati](https://github.com/eLBati.png?size=30px)](https://github.com/eLBati) | Restrict some users to see and use only certain points of sale

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
