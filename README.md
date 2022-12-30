
[![Runboat](https://img.shields.io/badge/runboat-Try%20me-875A7B.png)](https://runboat.odoo-community.org/builds?repo=OCA/pos&target_branch=14.0)
[![Pre-commit Status](https://github.com/OCA/pos/actions/workflows/pre-commit.yml/badge.svg?branch=14.0)](https://github.com/OCA/pos/actions/workflows/pre-commit.yml?query=branch%3A14.0)
[![Build Status](https://github.com/OCA/pos/actions/workflows/test.yml/badge.svg?branch=14.0)](https://github.com/OCA/pos/actions/workflows/test.yml?query=branch%3A14.0)
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
[pos_access_right](pos_access_right/) | 14.0.1.0.2 |  | Point of Sale - Extra Access Right for certain actions
[pos_backend_communication](pos_backend_communication/) | 14.0.1.0.1 | [![hparfr](https://github.com/hparfr.png?size=30px)](https://github.com/hparfr) | Communicate with odoo's backend from POS.
[pos_cash_move_reason](pos_cash_move_reason/) | 14.0.1.1.0 |  | POS cash in-out reason
[pos_customer_required](pos_customer_required/) | 14.0.1.0.0 |  | Point of Sale Require Customer
[pos_customer_tree_view_vat](pos_customer_tree_view_vat/) | 14.0.1.0.1 | [![mileo](https://github.com/mileo.png?size=30px)](https://github.com/mileo) | Point of Sale: Show VAT number at Customer Tree View
[pos_default_partner](pos_default_partner/) | 14.0.1.0.0 |  | Add a default customer in pos order
[pos_disable_pricelist_selection](pos_disable_pricelist_selection/) | 14.0.1.0.1 |  | Disable Pricelist selection button in POS
[pos_edit_order_line](pos_edit_order_line/) | 14.0.1.0.2 |  | POS Edit Order Line
[pos_empty_home](pos_empty_home/) | 14.0.1.0.0 |  | Point of Sale - Hide products if no category is selected
[pos_escpos_status](pos_escpos_status/) | 14.0.1.0.0 |  | Point of sale: fetch status for 'escpos' driver
[pos_fixed_discount](pos_fixed_discount/) | 14.0.1.0.1 | [![eLBati](https://github.com/eLBati.png?size=30px)](https://github.com/eLBati) | Allow to apply discounts with fixed amount
[pos_global_discount_in_line](pos_global_discount_in_line/) | 14.0.1.0.0 |  | Order discount in line instead of discount product
[pos_hide_banknote_button](pos_hide_banknote_button/) | 14.0.1.0.1 |  | Hide useless Banknote buttons in the PoS (+10, +20, +50)
[pos_margin](pos_margin/) | 14.0.1.0.2 | [![legalsylvain](https://github.com/legalsylvain.png?size=30px)](https://github.com/legalsylvain) | Margin on PoS Order
[pos_no_cash_bank_statement](pos_no_cash_bank_statement/) | 14.0.1.0.2 | [![alexis-via](https://github.com/alexis-via.png?size=30px)](https://github.com/alexis-via) | Generate bank statements for all payment methods, not only cash
[pos_order_product_search](pos_order_product_search/) | 14.0.1.0.0 |  | Search for orders by product fields
[pos_order_remove_line](pos_order_remove_line/) | 14.0.1.0.0 | [![robyf70](https://github.com/robyf70.png?size=30px)](https://github.com/robyf70) | Add button to remove POS order line.
[pos_order_return](pos_order_return/) | 14.0.1.0.1 |  | Point of Sale Order Return
[pos_partner_firstname](pos_partner_firstname/) | 14.0.1.0.1 | [![robyf70](https://github.com/robyf70.png?size=30px)](https://github.com/robyf70) | POS Support of partner firstname
[pos_payment_change](pos_payment_change/) | 14.0.1.0.0 | [![legalsylvain](https://github.com/legalsylvain.png?size=30px)](https://github.com/legalsylvain) | Allow cashier to change order payments, as long as the session is not closed.
[pos_payment_method_cashdro](pos_payment_method_cashdro/) | 14.0.1.0.0 |  | Allows to pay with CashDro Terminals on the Point of Sale
[pos_payment_terminal](pos_payment_terminal/) | 14.0.2.1.0 |  | Point of sale: support generic payment terminal
[pos_product_display_default_code](pos_product_display_default_code/) | 14.0.1.0.1 |  | pos: display product default code before product name
[pos_product_multi_barcode](pos_product_multi_barcode/) | 14.0.1.0.2 |  | Make product multi barcodes usable in the point of sale
[pos_product_sort](pos_product_sort/) | 14.0.1.0.0 |  | sort the products by name in the point of sale instead of sorting them by the sequence field.
[pos_product_template](pos_product_template/) | 14.0.1.0.2 |  | Manage Product Template in Front End Point Of Sale
[pos_product_template_configurator](pos_product_template_configurator/) | 14.0.1.0.0 | [![GabbasovDinar](https://github.com/GabbasovDinar.png?size=30px)](https://github.com/GabbasovDinar) [![isserver1](https://github.com/isserver1.png?size=30px)](https://github.com/isserver1) | Manage Product Template in Front End Point Of Sale via Configurator
[pos_receipt_hide_price](pos_receipt_hide_price/) | 14.0.1.0.1 |  | Add button to remove price from receipt.
[pos_report_session_summary](pos_report_session_summary/) | 14.0.1.0.2 |  | Adds a Session Summary PDF report on the POS session
[pos_require_product_quantity](pos_require_product_quantity/) | 14.0.1.0.0 |  | A popup is shown if product quantity is set to 0 for one or more order lines when clicking on "Payment" button.
[pos_reset_search](pos_reset_search/) | 14.0.1.0.1 | [![fkawala](https://github.com/fkawala.png?size=30px)](https://github.com/fkawala) | Point of Sale - Clear product search when user clicks on a product.
[pos_reuse_pricelist](pos_reuse_pricelist/) | 14.0.1.0.1 |  | PoS reuse pricelist
[pos_session_pay_invoice](pos_session_pay_invoice/) | 14.0.1.0.1 |  | Pay and receive invoices from PoS Session
[pos_show_config_name](pos_show_config_name/) | 14.0.1.0.0 |  | Point of sale: show pos config name
[pos_supplierinfo_barcode](pos_supplierinfo_barcode/) | 14.0.1.0.0 | [![eLBati](https://github.com/eLBati.png?size=30px)](https://github.com/eLBati) | Search products by supplier barcode
[pos_supplierinfo_search](pos_supplierinfo_search/) | 14.0.1.0.0 | [![eLBati](https://github.com/eLBati.png?size=30px)](https://github.com/eLBati) | Search products by supplier data
[pos_ticket_without_price](pos_ticket_without_price/) | 14.0.1.0.0 |  | Adds receipt ticket without price or taxes
[pos_timeout](pos_timeout/) | 14.0.1.0.0 |  | Set the timeout of the point of sale
[pos_user_restriction](pos_user_restriction/) | 14.0.1.0.0 | [![eLBati](https://github.com/eLBati.png?size=30px)](https://github.com/eLBati) | Restrict some users to see and use only certain points of sale
[pos_warning_exiting](pos_warning_exiting/) | 14.0.1.0.0 |  | Add warning at exiting the PoS front office UI if there are pending draft orders

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
