/* eslint-disable */
odoo.define("pos_sale_product_config_no_variant.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const PosNoVariantProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            async _getAddProductOptions(product, base_code) {
                let price_extra = 0.0;
                let draftPackLotLines, weight, description, packLotLinesToEdit;
                let product_no_variant_attribute_value_ids = [];

                if (
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
                        product_no_variant_attribute_value_ids =
                            payload.product_no_variant_attribute_value_ids;
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
                            weight = payload.weight;
                        } else {
                            // Do not add the product;
                            return;
                        }
                    } else {
                        await this._onScaleNotAvailable();
                    }
                }

                if (
                    base_code &&
                    this.env.pos.db.product_packaging_by_barcode[base_code.code]
                ) {
                    weight =
                        this.env.pos.db.product_packaging_by_barcode[base_code.code]
                            .qty;
                }

                return {
                    draftPackLotLines,
                    quantity: weight,
                    description,
                    price_extra,
                    product_no_variant_attribute_value_ids,
                };
            }
        };

    Registries.Component.extend(ProductScreen, PosNoVariantProductScreen);

    return ProductScreen;
});
