/* Copyright NuoBiT - Eric Antones <eantones@nuobit.com>
   Copyright NuoBiT - Kilian Niubo <kniubo@nuobit.com>
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl) */
odoo.define("pos_customer_required.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const PosRequiredCustomerProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            async willPatch() {
                if (
                    this.env.pos.config.require_customer === "order" &&
                    !this.env.pos.get_order().get_client()
                ) {
                    this._onClickCustomer();
                }
            }
        };

    Registries.Component.extend(ProductScreen, PosRequiredCustomerProductScreen);

    return PosRequiredCustomerProductScreen;
});
