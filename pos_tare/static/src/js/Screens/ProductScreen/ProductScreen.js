odoo.define("pos_tare.screens", function (require) {
    "use strict";
    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");
    const {useBarcodeReader} = require("point_of_sale.custom_hooks");

    const TareProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            constructor() {
                super(...arguments);
                useBarcodeReader({
                    // We add the tare action
                    tare: this._barcodeTareAction,
                });
            }

            async _barcodeTareAction(code) {
                var last_orderline = this.currentOrder.get_last_orderline();
                if (last_orderline) {
                    last_orderline.set_tare(code.value, true);
                }
            }

            async _getAddProductOptions(product) {
                return super._getAddProductOptions(product).then((payload) => {
                    if (!payload) return;
                    if (!payload.quantity) return payload;

                    const {weight, tare} = payload.quantity;
                    return {
                        ...payload,
                        quantity: weight,
                        tare: tare,
                    };
                });
            }

            _setValue(val) {
                super._setValue(val);
                if (this.currentOrder.get_selected_orderline()) {
                    if (this.state.numpadMode === "tare") {
                        if (this.env.pos.config.iface_tare_method === "barcode") {
                            this.showPopup("ErrorPopup", {
                                title: this.env._t("Feature Disabled"),
                                body: this.env._t(
                                    "You can not set the tare." +
                                        " To be able to set the tare manually" +
                                        " you have to change the tare input method" +
                                        " in the POS configuration"
                                ),
                            });
                        } else {
                            try {
                                this.currentOrder
                                    .get_selected_orderline()
                                    .set_tare(val, true);
                            } catch (error) {
                                this.showPopup("ErrorPopup", {
                                    title: this.env._t("We can not apply this tare"),
                                    body: error.message,
                                });
                            }
                        }
                    }
                }
            }
        };

    Registries.Component.extend(ProductScreen, TareProductScreen);

    return ProductScreen;
});
