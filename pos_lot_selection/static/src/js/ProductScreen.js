/*
    Copyright 2022 Camptocamp SA (https://www.camptocamp.com).
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_lot_selection.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const PosLotSaleProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            async _getAddProductOptions(product, base_code) {
                var self = this;
                if (["serial", "lot"].includes(product.tracking)) {
                    // Set lots to context as it one possible way to extract arguments
                    // later in popup
                    this.env.session.lots = await this.env.pos.get_lots(product);
                }
                return super
                    ._getAddProductOptions(product, (base_code = base_code))
                    .then(function (result) {
                        self.env.session.lots = [];
                        return result;
                    });
            }
        };

    Registries.Component.extend(ProductScreen, PosLotSaleProductScreen);
    return ProductScreen;
});
