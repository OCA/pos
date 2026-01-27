/*
Copyright (C) 2024-Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_restaurant_receipt_usability.ReceiptScreen", function (require) {
    "use strict";

    const ReceiptScreen = require("point_of_sale.ReceiptScreen");
    const Registries = require("point_of_sale.Registries");

    const OverloadReceiptScreen = (OriginalReceiptScreen) =>
        class extends OriginalReceiptScreen {
            get hideContinueCashIn() {
                return this.env.pos.get_order().splitted_order === false;
            }

            continueCashIn() {
                var splitted_order = this.env.pos.get_order().splitted_order;
                this.env.pos.removeOrder(this.env.pos.get_order());
                this.env.pos.set_order(splitted_order);
                this.showScreen("SplitBillScreen");
            }
        };
    Registries.Component.extend(ReceiptScreen, OverloadReceiptScreen);
    return ReceiptScreen;
});
