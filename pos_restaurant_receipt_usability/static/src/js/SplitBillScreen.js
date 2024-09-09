/*
Copyright (C) 2024-Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_restaurant_receipt_usability.SplitBillScreen", function (require) {
    "use strict";

    const SplitBillScreen = require("pos_restaurant.SplitBillScreen");
    const Registries = require("point_of_sale.Registries");

    const OverloadSplitBillScreen = (OriginalSplitBillScreen) =>
        class extends OriginalSplitBillScreen {
            render() {
                // Link the new created order with the original one
                this.newOrder.splitted_order = this.env.pos.get_order();
            }
        };
    Registries.Component.extend(SplitBillScreen, OverloadSplitBillScreen);
    return SplitBillScreen;
});
