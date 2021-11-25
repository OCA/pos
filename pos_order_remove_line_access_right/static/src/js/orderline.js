odoo.define("pos_order_remove_line_access_right.Orderline", function (require) {
    "use strict";

    const Orderline = require("point_of_sale.Orderline");
    const Registries = require("point_of_sale.Registries");

    const PosOrderline = (Orderline) =>
        class extends Orderline {
            get hasDeleteOrderLineControlRights() {
                if (this.env.pos.get_cashier().hasGroupDeleteOrderLine) {
                    return true;
                }
                return false;
            }
            removeLine() {
                if (this.env.pos.get_cashier().hasGroupDeleteOrderLine) {
                    return super.removeLine();
                }
            }
        };
    Registries.Component.extend(Orderline, PosOrderline);
    return Orderline;
});
