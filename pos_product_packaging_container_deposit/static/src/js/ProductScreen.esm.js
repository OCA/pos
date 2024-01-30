odoo.define(
    "pos_product_packaging_container_deposit.ProductScreen",
    function (require) {
        const ProductScreen = require("point_of_sale.ProductScreen");
        const Registries = require("point_of_sale.Registries");

        const PosDepositProductScreen = (ProductScreen) =>
            class extends ProductScreen {
                // @Override
                async _barcodeProductAction(code) {
                    const resp = await super._barcodeProductAction(...arguments);
                    await this._addDepositProduct(code);
                    return resp;
                }
                async _addDepositProduct(code) {
                    const selectedLine = this.currentOrder.get_selected_orderline();
                    if (!selectedLine) return;
                    if (selectedLine.container_deposit_line_id) {
                        // If selected line has linked to container_deposit_line_id,
                        // the qty will be handled in set_quantity()
                        const checkDepositLine = this.currentOrder.get_orderline(
                            selectedLine.container_deposit_line_id
                        );
                        if (checkDepositLine) return;
                    }
                    const packaging =
                        this.env.pos.db.product_packaging_by_barcode[code.base_code];
                    if (
                        !packaging ||
                        selectedLine.product.id !== packaging.product_id[0]
                    ) {
                        return;
                    }
                    const deposit_product =
                        this.env.pos.db.product_packaging_by_barcode[code.base_code]
                            .container_deposit_product_id;
                    if (!deposit_product) return;

                    const currentQuantity = selectedLine.get_quantity();
                    const packaging_qty = packaging.qty;
                    if (packaging_qty <= 0) return;
                    const deposit_qty = this.currentOrder._getDepositQty(
                        currentQuantity,
                        packaging_qty
                    );
                    if (this.env.pos.isProductQtyZero(deposit_qty)) return;

                    // Add deposit to the order.
                    let product = this.env.pos.db.get_product_by_id(deposit_product[0]);
                    if (!product) {
                        await this.env.pos._addProducts([deposit_product[0]], false);
                        product = this.env.pos.db.get_product_by_id(deposit_product[0]);
                    }
                    const options = await this._getAddProductOptions(product);
                    if (!options) return;

                    const options_extra = await this._getDepositProductOptions(product);
                    options_extra.deposit_packaging_qty = packaging_qty;
                    Object.assign(options, {
                        quantity: deposit_qty,
                        extras: options_extra,
                        merge: false,
                    });
                    // Add the product after having the extra information.
                    await this._addProduct(product, options);
                    const depositLine = this.currentOrder.get_selected_orderline();
                    selectedLine.container_deposit_line_id = depositLine.id;
                    return;
                }

                async _getDepositProductOptions() {
                    return {is_container_deposit: true};
                }
            };

        Registries.Component.extend(ProductScreen, PosDepositProductScreen);

        return ProductScreen;
    }
);
