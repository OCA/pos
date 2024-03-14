/** @odoo-module **/

import ProductScreen from "point_of_sale.ProductScreen";
import Registries from "point_of_sale.Registries";

export const POSProductWarning = (ProductScreen) =>
    class extends ProductScreen {
        async _onClickPay() {
            const order = this.env.pos.get_order();
            const orderlines = order
                .get_orderlines()
                .filter((line) => line.product.pos_warn_msg && line.quantity >= 0);
            const productSaleWarningList = _.uniq(
                _.pluck(_.pluck(orderlines, "product"), "pos_warn_msg")
            );
            if (productSaleWarningList.length > 0) {
                const {confirmed} = await this.showPopup("ProductWarningPopup", {
                    title: this.env._t("Warning !"),
                    list: productSaleWarningList,
                });
                if (confirmed) {
                    super._onClickPay();
                }
            } else {
                super._onClickPay();
            }
        }
    };

Registries.Component.extend(ProductScreen, POSProductWarning);
