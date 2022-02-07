/*
 Copyright 2020 Akretion France (http://www.akretion.com/)
 @author: Alexis de Lattre <alexis.delattre@akretion.com>
 License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_customer_display.CustomerDisplayProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const CustomerDisplayProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            constructor() {
                super(...arguments);
                this.env.pos.proxy.send_text_customer_display(
                    this.env.pos.proxy.prepare_message_welcome()
                );
            }
        };

    Registries.Component.extend(ProductScreen, CustomerDisplayProductScreen);

    return CustomerDisplayProductScreen;
});
