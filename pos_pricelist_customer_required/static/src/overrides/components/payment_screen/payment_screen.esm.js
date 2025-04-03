/* Copyright 2020 Akretion (https://www.akretion.com)
 * @author Raphaël Reverdy <raphael.reverdy@akretion.com>
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {PaymentScreen} from "@point_of_sale/app/screens/payment_screen/payment_screen";
import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";

patch(PaymentScreen.prototype, {
    _isOrderValid(isForceValidate) {
        // Block or allow customer to be unset
        var order = this.currentOrder;
        if (!order.get_partner()) {
            if (order.is_customer_required()) {
                this.dialog.add(AlertDialog, {
                    title: _t("Please select the Customer"),
                    body: _t("The customer is required for this pricelist"),
                });
                return false;
            }
        }
        return super._isOrderValid(isForceValidate);
    },
});
