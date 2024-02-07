odoo.define("pos_receipt_replace_user_by_trigram.models", function (require) {
    "use strict";

    var {Order} = require("point_of_sale.models");
    var Registries = require("point_of_sale.Registries");

    const AddCashierTrigramOrder = (Order) =>
        class CustomOrder extends Order {
            get_cashier_trigram() {
                return this.pos.get_cashier().pos_trigram || "";
            }
            export_for_printing() {
                var result = super.export_for_printing(...arguments);
                result.cashier_trigram = this.get_cashier_trigram();
                return result;
            }
        };
    Registries.Model.extend(Order, AddCashierTrigramOrder);
});
