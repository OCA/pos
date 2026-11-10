/* Copyright 2026 Acysos S.L.
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
 */

odoo.define("pos_product_combo_configurable.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");
    const {useListener} = require("@web/core/utils/hooks");

    const PosComboProductScreen = (ProductScreen) =>
        class PosComboProductScreen extends ProductScreen {
            setup() {
                super.setup();
                useListener("click-edit-combo", this._onClickEditCombo);
            }

            _getComboPackLines(product) {
                const packIds = product.combo_pack_ids || [];
                return packIds
                    .map((id) => this.env.pos.combo_pack_by_id[id])
                    .filter(Boolean);
            }

            async _getAddProductOptions(product, code) {
                const options = await super._getAddProductOptions(product, code);
                if (!options) {
                    return options;
                }
                if (product.is_combo) {
                    const comboPackLines = this._getComboPackLines(product);
                    const {confirmed, payload} = await this.showPopup(
                        "ComboProductPopup",
                        {
                            product: product,
                            combo_pack_lines: comboPackLines,
                        }
                    );
                    if (!confirmed) {
                        return undefined;
                    }
                    options.combo_prod_info = payload.combo_prod_info || [];
                    options.combo_extra_price = payload.combo_extra_price || 0.0;
                    options.price_extra =
                        (options.price_extra || 0.0) +
                        (payload.combo_extra_price || 0.0);
                    options.merge = false;
                }
                return options;
            }

            async _onClickEditCombo(event) {
                const orderline = event.detail.orderline;
                if (!orderline) {
                    return;
                }
                const product = orderline.get_product();
                const comboPackLines = this._getComboPackLines(product);
                const {confirmed, payload} = await this.showPopup("ComboProductPopup", {
                    product: product,
                    combo_pack_lines: comboPackLines,
                    initial_selected_lines: orderline.get_combo_prod_info(),
                });
                if (confirmed) {
                    orderline.set_combo_prod_info(payload.combo_prod_info || []);
                    orderline.set_combo_extra_price(payload.combo_extra_price || 0.0);
                    orderline.update_combo_price();
                }
            }
        };

    Registries.Component.extend(ProductScreen, PosComboProductScreen);

    return PosComboProductScreen;
});
