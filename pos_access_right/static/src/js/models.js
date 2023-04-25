odoo.define("pos_access_right.models", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    var {Order} = require("point_of_sale.models");

    const PosAccessRightOrder = (Order) =>
        class PosAccessRightOrder extends Order {
            remove_orderline(line) {
                if (
                    this.pos.get_cashier().hasGroupDeleteOrderLine &&
                    this.pos.user.hasGroupDeleteOrderLine
                ) {
                    return super.remove_orderline(line);
                }
                return false;
            }
        };
    Registries.Model.extend(Order, PosAccessRightOrder);
});
