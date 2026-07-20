/*
Copyright (C) 2026-Today: GRAP (https://www.grap.coop)
@author: Quentin DUPONT
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/
odoo.define(
    "pos_restaurant_split_order_usability.SplitBillScreenPatch",
    function (require) {
        const SplitBillScreen = require("pos_restaurant.SplitBillScreen");
        const {patch} = require("web.utils");
        const Registries = require("point_of_sale.Registries");

        patch(
            SplitBillScreen.prototype,
            "pos_restaurant_split_order_usability.SplitBillScreenPatch",
            {
                /**
                 * At new order creation (from split), set write in database
                 * origin_order_uid field thanks to _order_fields
                 * to be retrieve with JS rpc
                 */
                proceed() {
                    if (this.newOrder) {
                        this.newOrder.origin_order_uid =
                            this.currentOrder.origin_order_uid || this.currentOrder.uid;
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
