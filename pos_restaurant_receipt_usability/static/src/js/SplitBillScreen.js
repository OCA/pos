/*
Copyright (C) 2024-Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL
@author: Quentin DUPONT
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define(
    "pos_restaurant_receipt_usability.SplitBillScreenPatchReceipt",
    function (require) {
        "use strict";

        const SplitBillScreen = require("pos_restaurant.SplitBillScreen");
        const {patch} = require("web.utils");
        const Registries = require("point_of_sale.Registries");

        patch(
            SplitBillScreen.prototype,
            "pos_restaurant_split_order_usability.SplitBillScreenPatchReceipt",
            {
                /**
                 * Link the new created order with the original one
                 */
                proceed() {
                    if (this.newOrder) {
                        this.newOrder.splitted_order = this.env.pos.get_order();
                    }
                    if (this._super) {
                        this._super(...arguments);
                    }
                },
            }
        );

        Registries.Component.add(SplitBillScreen);
        return SplitBillScreen;
    }
);
