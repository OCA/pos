/** @odoo-module **/

/*
  Copyright 2019 Coop IT Easy SCRLfs
    Robin Keunen <robin@coopiteasy.be>
    Simon Hick <simon.hick@coopiteasy.be>
  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

import ProductScreen from "point_of_sale.ProductScreen";
import Registries from "point_of_sale.Registries";

const PosRequireProductQuantityProductScreen = (OriginalProductScreen) =>
    class extends OriginalProductScreen {
        async _onClickPay() {
            if (this.env.pos.config.require_product_quantity) {
                const lines_without_qty = _.filter(
                    this.env.pos.get_order().get_orderlines(),
                    function (line) {
                        return line.quantity === 0;
                    }
                );
                if (lines_without_qty.length > 0) {
                    await this.showPopup("ConfirmPopup", {
                        title: this.env._t("Missing quantities"),
                        body:
                            this.env._t("No quantity set for products:") +
                            "\n" +
                            _.map(lines_without_qty, function (line) {
                                return " - " + line.product.display_name;
                            }).join("\n"),
                    });
                    return;
                }
            }
            super._onClickPay(...arguments);
        }
    };

Registries.Component.extend(ProductScreen, PosRequireProductQuantityProductScreen);
