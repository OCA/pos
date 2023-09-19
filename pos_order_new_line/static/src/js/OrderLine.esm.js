/*
    Copyright (C) 2023-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/

odoo.define("pos_order_new_line.OrderLine", function (require) {
    var {Orderline} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    const OverloadOrderLine = (OriginalOrderline) =>
        class extends OriginalOrderline {
            can_be_merged_with() {
                const order = this.pos.get_order();
                if (order.create_new_line) {
                    return false;
                }
                return super.can_be_merged_with(...arguments);
            }
        };
    Registries.Model.extend(Orderline, OverloadOrderLine);
});
