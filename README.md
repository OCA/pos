[![Runbot Status](https://runbot.odoo-community.org/runbot/badge/flat/184/14.0.svg)](https://runbot.odoo-community.org/runbot/repo/github-com-oca-pos-184)
[![Build Status](https://travis-ci.com/OCA/pos.svg?branch=14.0)](https://travis-ci.com/OCA/pos)
[![codecov](https://codecov.io/gh/OCA/pos/branch/14.0/graph/badge.svg)](https://codecov.io/gh/OCA/pos)
[![Translation Status](https://translation.odoo-community.org/widgets/pos-14-0/-/svg-badge.svg)](https://translation.odoo-community.org/engage/pos-14-0/?utm_source=widget)

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
[pos_access_right](pos_access_right/) | 14.0.1.0.1 |  | Point of Sale - Extra Access Right for certain actions
[pos_backend_communication](pos_backend_communication/) | 14.0.1.0.0 |  | Communicate with odoo's backend from POS.
[pos_cash_move_reason](pos_cash_move_reason/) | 14.0.1.0.0 |  | POS cash in-out reason
[pos_default_partner](pos_default_partner/) | 14.0.1.0.0 |  | Add a default customer in pos order
[pos_empty_home](pos_empty_home/) | 14.0.1.0.0 |  | Point of Sale - Hide products if no category is selected
[pos_escpos_status](pos_escpos_status/) | 14.0.1.0.0 |  | Point of sale: fetch status for 'escpos' driver
[pos_fixed_discount](pos_fixed_discount/) | 14.0.1.0.1 | [![eLBati](https://github.com/eLBati.png?size=30px)](https://github.com/eLBati) | Allow to apply discounts with fixed amount
[pos_hide_banknote_button](pos_hide_banknote_button/) | 14.0.1.0.1 |  | Hide useless Banknote buttons in the PoS (+10, +20, +50)
[pos_margin](pos_margin/) | 14.0.1.0.1 | [![legalsylvain](https://github.com/legalsylvain.png?size=30px)](https://github.com/legalsylvain) | Margin on PoS Order
[pos_order_remove_line](pos_order_remove_line/) | 14.0.1.0.0 | [![robyf70](https://github.com/robyf70.png?size=30px)](https://github.com/robyf70) | Add button to remove POS order line.
[pos_order_return](pos_order_return/) | 14.0.1.0.0 |  | Point of Sale Order Return
[pos_payment_change](pos_payment_change/) | 14.0.1.0.0 | [![legalsylvain](https://github.com/legalsylvain.png?size=30px)](https://github.com/legalsylvain) | Allow cashier to change order payments, as long as the session is not closed.
[pos_payment_terminal](pos_payment_terminal/) | 14.0.2.0.0 |  | Point of sale: support generic payment terminal
[pos_product_sort](pos_product_sort/) | 14.0.1.0.0 |  | sort the products by name in the point of sale instead of sorting them by the sequence field.
[pos_require_product_quantity](pos_require_product_quantity/) | 14.0.1.0.0 |  | A popup is shown if product quantity is set to 0 for one or more order lines when clicking on "Payment" button.
[pos_show_config_name](pos_show_config_name/) | 14.0.1.0.0 |  | Point of sale: show pos config name
[pos_supplierinfo_search](pos_supplierinfo_search/) | 14.0.1.0.0 | [![eLBati](https://github.com/eLBati.png?size=30px)](https://github.com/eLBati) | Search products by supplier data
[pos_timeout](pos_timeout/) | 14.0.1.0.0 |  | Set the timeout of the point of sale
[pos_user_restriction](pos_user_restriction/) | 14.0.1.0.0 | [![eLBati](https://github.com/eLBati.png?size=30px)](https://github.com/eLBati) | Restrict some users to see and use only certain points of sale
[pos_warning_exiting](pos_warning_exiting/) | 14.0.1.0.0 |  | Add warning at exiting the PoS front office UI if there are pending draft orders

[//]: # (end addons)

<!-- prettier-ignore-end -->

## Licenses

This repository is licensed under [AGPL-3.0](LICENSE).

However, each module can have a totally different license, as long as they adhere to OCA
policy. Consult each module's `__manifest__.py` file, which contains a `license` key
that explains its license.

----

OCA, or the [Odoo Community Association](http://odoo-community.org/), is a nonprofit
organization whose mission is to support the collaborative development of Odoo features
and promote its widespread use.
