/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/
odoo.define("pos_lot_barcode.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");
    const {useBarcodeReader} = require("point_of_sale.custom_hooks");
    const {isConnectionError} = require("point_of_sale.utils");
    const {_lt} = require("@web/core/l10n/translation");

    const PosLotBarcodeProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            setup() {
                super.setup();
                this.scan_lots_active = true;
                useBarcodeReader({
                    lot: this._barcodeLotAction,
                });
            }
            async _barcodeLotAction(code) {
                // Do not do anything if lot scanning is not active
                if (!this.scan_lots_active) return;
                // Get the product according to lot barcode
                const product = await this._getProductByLotBarcode(code);
                // If we didn't get a product it must display a popup
                if (!product) return;
                // Get possible options not linked to lot selection
                const options = await this._getAddLotProductOptions(product, code);
                // Do not proceed on adding the product when no options is returned.
                // This is consistent with _clickProduct.
                if (!options) return;
                this.currentOrder.add_product(product, options);
            }
            async _getProductByLotBarcode(base_code) {
                const foundLotIds = await this._searchLotProduct(base_code.code);
                if (foundLotIds.length === 1) {
                    let product = this.env.pos.db.get_product_by_id(
                        foundLotIds[0].product_id[0]
                    );
                    if (!product) {
                        // If product is not loaded in POS, load it
                        await this.env.pos._addProducts(foundLotIds[0].product_id[0]);
                        // Assume that the result is unique.
                        product = this.env.pos.db.get_product_by_id(
                            foundLotIds[0].product_id[0]
                        );
                    }
                    return product;
                } else if (foundLotIds.length > 1) {
                    // If we found more than a single lot in backend, raise error
                    this._barcodeMultiLotErrorAction(
                        base_code,
                        _.map(foundLotIds, (lot) => lot.product_id[1])
                    );
                    return false;
                }
                this._barcodeLotErrorAction(base_code);
                return false;
            }
            async _searchLotProduct(code) {
                let foundLotIds = [];
                try {
                    foundLotIds = await this.rpc({
                        model: "stock.lot",
                        method: "search_read",
                        domain: [["name", "=", code]],
                        fields: ["id", "product_id"],
                        context: this.env.session.user_context,
                    });
                } catch (error) {
                    if (isConnectionError(error)) {
                        return this.showPopup("OfflineErrorPopup", {
                            title: this.env._t("Network Error"),
                            body: this.env._t(
                                "Lot is not loaded. Tried loading the lot from the server but there is a network error."
                            ),
                        });
                    }
                    throw error;
                }
                return foundLotIds;
            }
            async _getAddProductOptions() {
                // Deactivate lot scanning if lot selection popup must be opened
                this.scan_lots_active = false;
                const options = await super._getAddProductOptions(...arguments);
                this.scan_lots_active = true;
                return options;
            }
            async _getAddLotProductOptions(product, base_code) {
                // Copy and reimplement _getAddProductOptions with lot taken from base_code parameter
                let price_extra = 0.0;
                let weight = 0.0;
                let description = "";
                let draftPackLotLines = [];
                let packLotLinesToEdit = [];
                let existingPackLotLines = [];
                let newPackLotLines = [];
                // Keep opening the product configurator if needed (copied from _getAddProductOptions)
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
                // Set lot information, check still needed for picking_type (copied from _getAddProductOptions)
                if (
                    this.env.pos.picking_type.use_create_lots ||
                    this.env.pos.picking_type.use_existing_lots
                ) {
                    // Build packLotLinesToEdit (copied from _getAddProductOptions)
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
                    // Remove new Id from packLotLinesToEdit if we have any
                    existingPackLotLines = {};
                    if (packLotLinesToEdit.length) {
                        existingPackLotLines = Object.fromEntries(
                            packLotLinesToEdit
                                .filter((item) => item.id)
                                .map((item) => [item.id, item.text])
                        );
                    }
                    // Define new lot using scanned barcode
                    newPackLotLines = [{lot_name: base_code.code}];
                    draftPackLotLines = {
                        modifiedPackLotLines: existingPackLotLines,
                        newPackLotLines,
                    };
                }

                // Take the weight if necessary. (copied from _getAddProductOptions)
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
                return {draftPackLotLines, quantity: weight, description, price_extra};
            }
            _barcodeLotErrorAction(code) {
                return this.showPopup("ErrorBarcodePopup", {
                    code: this._codeRepr(code),
                    message: _lt(
                        "The Point of Sale could not find any product, lot, client, employee or action associated with the scanned barcode."
                    ),
                });
            }
            _barcodeMultiLotErrorAction(code, product_names) {
                return this.showPopup("ErrorMultiLotBarcodePopup", {
                    code: this._codeRepr(code),
                    products: product_names,
                });
            }
        };

    Registries.Component.extend(ProductScreen, PosLotBarcodeProductScreen);

    return ProductScreen;
});
