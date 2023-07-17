
[![Runboat](https://img.shields.io/badge/runboat-Try%20me-875A7B.png)](https://runboat.odoo-community.org/builds?repo=OCA/pos&target_branch=16.0)
[![Pre-commit Status](https://github.com/OCA/pos/actions/workflows/pre-commit.yml/badge.svg?branch=16.0)](https://github.com/OCA/pos/actions/workflows/pre-commit.yml?query=branch%3A16.0)
[![Build Status](https://github.com/OCA/pos/actions/workflows/test.yml/badge.svg?branch=16.0)](https://github.com/OCA/pos/actions/workflows/test.yml?query=branch%3A16.0)
[![codecov](https://codecov.io/gh/OCA/pos/branch/16.0/graph/badge.svg)](https://codecov.io/gh/OCA/pos)
[![Translation Status](https://translation.odoo-community.org/widgets/pos-16-0/-/svg-badge.svg)](https://translation.odoo-community.org/engage/pos-16-0/?utm_source=widget)

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
[pos_customer_comment](pos_customer_comment/) | 16.0.1.0.0 | [![legalsylvain](https://github.com/legalsylvain.png?size=30px)](https://github.com/legalsylvain) | Display Customer comment in the PoS front office and allow to edit and save it by the cashier
[pos_default_partner](pos_default_partner/) | 16.0.1.0.0 |  | Add a default customer in pos order
[pos_edit_order_line](pos_edit_order_line/) | 16.0.1.0.1 |  | POS Edit Order Line
[pos_escpos_status](pos_escpos_status/) | 16.0.1.0.0 |  | Point of sale: fetch status for 'escpos' driver
[pos_global_discount_in_line](pos_global_discount_in_line/) | 16.0.1.0.0 |  | Order discount in line instead of discount product
[pos_lot_barcode](pos_lot_barcode/) | 16.0.1.0.0 |  | Scan barcode to enter lot/serial numbers
[pos_lot_selection](pos_lot_selection/) | 16.0.1.0.0 |  | POS Lot Selection
[pos_loyalty_redeem_payment](pos_loyalty_redeem_payment/) | 16.0.1.0.0 |  | Use vouchers as payment method in pos orders
[pos_margin](pos_margin/) | 16.0.1.0.1 | [![legalsylvain](https://github.com/legalsylvain.png?size=30px)](https://github.com/legalsylvain) | Margin on PoS Order
[pos_membership](pos_membership/) | 16.0.1.0.0 | [![legalsylvain](https://github.com/legalsylvain.png?size=30px)](https://github.com/legalsylvain) | Implement features of membership module in the Point of sale UI.
[pos_order_remove_line](pos_order_remove_line/) | 16.0.1.1.0 | [![robyf70](https://github.com/robyf70.png?size=30px)](https://github.com/robyf70) | Add button to remove POS order line.
[pos_order_reorder](pos_order_reorder/) | 16.0.0.1.0 | [![GabbasovDinar](https://github.com/GabbasovDinar.png?size=30px)](https://github.com/GabbasovDinar) [![CetmixGitDrone](https://github.com/CetmixGitDrone.png?size=30px)](https://github.com/CetmixGitDrone) | Simple Re-order in the Point of Sale
[pos_order_to_sale_order](pos_order_to_sale_order/) | 16.0.1.0.3 | [![legalsylvain](https://github.com/legalsylvain.png?size=30px)](https://github.com/legalsylvain) | PoS Order To Sale Order
[pos_partner_birthdate](pos_partner_birthdate/) | 16.0.1.0.1 | [![ecino](https://github.com/ecino.png?size=30px)](https://github.com/ecino) | Adds the birthdate in the customer screen of POS
[pos_payment_change](pos_payment_change/) | 16.0.1.0.0 | [![legalsylvain](https://github.com/legalsylvain.png?size=30px)](https://github.com/legalsylvain) | Allow cashier to change order payments, as long as the session is not closed.
[pos_payment_terminal](pos_payment_terminal/) | 16.0.1.0.1 |  | Point of sale: support generic payment terminal
[pos_product_display_default_code](pos_product_display_default_code/) | 16.0.1.0.0 |  | pos: display product default code before product name
[pos_product_quick_info](pos_product_quick_info/) | 16.0.1.0.0 | [![GabbasovDinar](https://github.com/GabbasovDinar.png?size=30px)](https://github.com/GabbasovDinar) [![CetmixGitDrone](https://github.com/CetmixGitDrone.png?size=30px)](https://github.com/CetmixGitDrone) | Display product info by one click in Point of Sale
[pos_receipt_hide_price](pos_receipt_hide_price/) | 16.0.1.0.0 |  | Add button to remove price from receipt.
[pos_stock_available_online](pos_stock_available_online/) | 16.0.1.0.0 | [![GabbasovDinar](https://github.com/GabbasovDinar.png?size=30px)](https://github.com/GabbasovDinar) [![CetmixGitDrone](https://github.com/CetmixGitDrone.png?size=30px)](https://github.com/CetmixGitDrone) | Show the available quantity of products in the Point of Sale

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
