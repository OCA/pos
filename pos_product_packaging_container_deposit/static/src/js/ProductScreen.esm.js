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
                    const product = await this._getProductByBarcode(code);
                    if (!product) {
                        return resp;
                    }
                    const barcode_packaging =
                        this.env.pos.db.product_packaging_by_barcode[code.base_code];

                    // Load missing product packagings linked to the product
                    await this._addMissingProductPackagings(product);

                    const packagings = product.packaging_ids.map(
                        (packagingId) =>
                            this.env.pos.db.product_packaging_by_id[packagingId]
                    );

                    // Load container deposit packagings to model Product
                    const container_deposit_packagings = product
                        .getContainerDepositPackagings(packagings)
                        .find(
                            (packaging) => packaging.quantity <= barcode_packaging.qty
                        );

                    const container_deposit_products =
                        container_deposit_packagings &&
                        container_deposit_packagings.container_deposit_products;
                    // Add container deposit products
                    if (container_deposit_products) {
                        await this._addContainerDepositProducts(
                            container_deposit_products
                        );
                    }
                    return resp;
                }

                async _addMissingProductPackagings(product) {
                    const packaging_ids = product.packaging_ids;
                    const missingPackagingsIds = packaging_ids.filter(
                        (id) => !this.env.pos.db.product_packaging_by_id[id]
                    );
                    if (missingPackagingsIds.length) {
                        await this.env.pos._addProductPackagings(missingPackagingsIds);
                    }
                }

                async _addContainerDepositProducts(container_deposit_products) {
                    // In case products are not available in POS
                    const productIds = container_deposit_products.map(
                        (item) => item.product_id
                    );
                    if (!this.env.pos.db.product_by_id.hasOwnProperty(productIds)) {
                        await this.env.pos._addProducts(productIds, false);
                    }
                    for (const product of container_deposit_products) {
                        const product_obj = this.env.pos.db.get_product_by_id(
                            product.product_id
                        );
                        await this._addProduct(product_obj, {
                            quantity: product.product_qty,
                            merge: false,
                        });
                    }
                }
            };

        Registries.Component.extend(ProductScreen, PosDepositProductScreen);

        return ProductScreen;
    }
);
