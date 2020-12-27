/* Copyright 2020 Akretion (https://www.akretion.com)
 * @author Raphaël Reverdy <raphael.reverdy@akretion.com>
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("pos_require_customer.PRCPaymentScreen", function (require) {
    "use strict";
    // Block or allow customer to be unset

    var PaymentScreen = require("point_of_sale.PaymentScreen");
    var Registries = require("point_of_sale.Registries");
    var core = require("web.core");
    var _t = core._t;

    var PRCPaymentScreen = (PaymentScreen) =>
        class PRCPaymentScreen extends PaymentScreen {
            async _isOrderValid(isForceValidate) {
                var order = this.currentOrder;
                if (!order.get_client()) {
                    if (order.is_customer_required()) {
                        var ret = await this.showPopup("ConfirmPopup", {
                            title: _t("Please select the Customer"),
                            body: _(
                                "You need to select the customer before you can invoice an order"
                            ),
                        });
                        if (ret.confirmed) {
                            this.selectClient();
                        }
                        return false;
                    }
                }
                return super._isOrderValid(isForceValidate);
            }
        };

    Registries.Component.extend(PaymentScreen, PRCPaymentScreen);

    return PRCPaymentScreen;
});
