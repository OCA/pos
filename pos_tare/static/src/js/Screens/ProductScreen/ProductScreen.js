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
                let price_extra = 0.0;
                let draftPackLotLines, weight, description, packLotLinesToEdit, tare; // eslint-disable-line

                if (
                    this.env.pos.config.product_configurator &&
                    _.some(
                        product.attribute_line_ids,
                        (id) => id in this.env.pos.attributes_by_ptal_id
                    )
                ) {
                    const attributes = _.map(
                        product.attribute_line_ids,
                        (id) => this.env.pos.attributes_by_ptal_id[id]
                    ).filter((attr) => attr !== undefined);
                    const {confirmed, payload} = await this.showPopup(
                        "ProductConfiguratorPopup",
                        {
                            product: product,
                            attributes: attributes,
                        }
                    );

                    if (confirmed) {
                        description = payload.selected_attributes.join(", ");
                        price_extra += payload.price_extra;
                    } else {
                        return;
                    }
                }

                // Gather lot information if required.
                if (
                    ["serial", "lot"].includes(product.tracking) &&
                    (this.env.pos.picking_type.use_create_lots ||
                        this.env.pos.picking_type.use_existing_lots)
                ) {
                    const isAllowOnlyOneLot = product.isAllowOnlyOneLot();
                    if (isAllowOnlyOneLot) {
                        packLotLinesToEdit = [];
                    } else {
                        const orderline = this.currentOrder
                            .get_orderlines()
                            .filter((line) => !line.get_discount())
                            .find((line) => line.product.id === product.id);
                        if (orderline) {
                            packLotLinesToEdit = orderline.getPackLotLinesToEdit();
                        } else {
                            packLotLinesToEdit = [];
                        }
                    }
                    const {confirmed, payload} = await this.showPopup("EditListPopup", {
                        title: this.env._t("Lot/Serial Number(s) Required"),
                        isSingleItem: isAllowOnlyOneLot,
                        array: packLotLinesToEdit,
                    });
                    if (confirmed) {
                        // Segregate the old and new packlot lines
                        const modifiedPackLotLines = Object.fromEntries(
                            payload.newArray
                                .filter((item) => item.id)
                                .map((item) => [item.id, item.text])
                        );
                        const newPackLotLines = payload.newArray
                            .filter((item) => !item.id)
                            .map((item) => ({lot_name: item.text}));

                        draftPackLotLines = {modifiedPackLotLines, newPackLotLines};
                    } else {
                        // We don't proceed on adding product.
                        return;
                    }
                }

                // Take the weight if necessary.
                if (product.to_weight && this.env.pos.config.iface_electronic_scale) {
                    // Show the ScaleScreen to weigh the product.
                    if (this.isScaleAvailable) {
                        const {confirmed, payload} = await this.showTempScreen(
                            "ScaleScreen",
                            {
                                product,
                            }
                        );
                        if (confirmed) {
                            // /////////////////////////////
                            // Overload Section
                            // We add the tare to the payload
                            // /////////////////////////////
                            weight = payload.weight;
                            tare = payload.tare;
                        } else {
                            // Do not add the product;
                            return;
                        }
                    } else {
                        await this._onScaleNotAvailable();
                    }
                }

                return {
                    draftPackLotLines,
                    quantity: weight,
                    description,
                    price_extra,
                    tare: tare,
                };
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
