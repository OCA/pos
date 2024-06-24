/* Copyright Aures Tic - Jose Zambudio <jose@aurestic.es>
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl) */
odoo.define("pos_order_mgmt.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const PosOrderMgmtProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            async _onClickPay() {
                if (
                    this.env.pos
                        .get_order()
                        .orderlines.any(
                            (line) =>
                                line.returned_orderline_id &&
                                Math.abs(line.quantity) > line.max_return_qty
                        )
                ) {
                    const {confirmed} = await this.showPopup("ConfirmPopup", {
                        title: this.env._t("Incorrect quantities"),
                        body: this.env._t(
                            `It is returning more than the quantity delivered.
                            Would you like to proceed anyway?`
                        ),
                        confirmText: this.env._t("Yes"),
                        cancelText: this.env._t("No"),
                    });
                    if (confirmed) {
                        return super._onClickPay(...arguments);
                    }
                } else {
                    return super._onClickPay(...arguments);
                }
            }
        };

    Registries.Component.extend(ProductScreen, PosOrderMgmtProductScreen);

    return PosOrderMgmtProductScreen;
});
