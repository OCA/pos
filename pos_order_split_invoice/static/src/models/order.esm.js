/** @odoo-module **/

import {ConfirmPopup} from "@point_of_sale/app/utils/confirm_popup/confirm_popup";
import {Order} from "@point_of_sale/app/store/models";
import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(Order.prototype, {
    canPay() {
        if (
            Boolean(!this.partner) &&
            this.orderlines.filter((line) => {
                return line.split_invoice_amount(this.pricelist, line.quantity) > 0;
            }).length > 0
        ) {
            if (ProductScreen === this.pos.mainScreen.component) {
                // Warning should only be raised on Product Screen.
                this.env.services.popup.add(ConfirmPopup, {
                    title: _t("Partner is not defined"),
                    body: _t(
                        "You need to define a partner because some lines will be splitted"
                    ),
                });
            }
            return false;
        }
        return super.canPay();
    },
});
