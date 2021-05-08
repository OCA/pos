/*
  Copyright 2019 Coop IT Easy SCRLfs
    Robin Keunen <robin@coopiteasy.be>
  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_require_product_quantity.screens", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");
    const {Gui} = require("point_of_sale.Gui");
    var core = require("web.core");
    var _t = core._t;

    const CustomProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            _onClickPay() {
                const result = super._onClickPay(...arguments);
                var lines_without_qty = _.filter(
                    this.env.pos.get_order().get_orderlines(),
                    function (line) {
                        return line.quantity === 0;
                    }
                );
                if (lines_without_qty.length > 0) {
                    this.showScreen("ProductScreen");
                    Gui.showPopup("ConfirmPopup", {
                        title: _t("Missing quantities"),
                        body:
                            _t("No quantity set for products:") +
                            "\n" +
                            _.map(lines_without_qty, function (line) {
                                return " - " + line.product.display_name;
                            }).join("\n"),
                    });
                }
                return result;
            }
        };

    Registries.Component.extend(ProductScreen, CustomProductScreen);
    return ProductScreen;
});
