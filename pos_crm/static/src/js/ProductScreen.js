/*
Copyright (C) 2022-Today KMEE (https://kmee.com.br)
 License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
*/

odoo.define("pos_crm.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const PosAskCustomerProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            async _clickProduct(event) {
                var order = this.env.pos.get_order();
                order.ask_customer_data(this, "order");
                return super._clickProduct(event);
            }
        };

    Registries.Component.extend(ProductScreen, PosAskCustomerProductScreen);

    return PosAskCustomerProductScreen;
});
