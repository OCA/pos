/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/

import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {patch} from "@web/core/utils/patch";
import {useBarcodeReader} from "@point_of_sale/app/barcode/barcode_reader_hook";
import {_t} from "@web/core/l10n/translation";

patch(ProductScreen.prototype, {
    setup() {
        super.setup();
        useBarcodeReader({
            lot: this._barcodeLotAction,
        });
    },
    async _barcodeLotAction(code) {
        // Get the product according to lot barcode
        const product = await this._getProductByLotBarcode(code);
        // If we didn't get a product it must display a popup
        if (!product) {
            this.barcodeReader.showNotFoundNotification(code);
            return;
        }
        if (product instanceof Array) {
            // If we found more than a single lot in backend, raise error
            const productNamesString = product
                .map(
                    (lot) => this.pos.models["product.product"].get(lot.product_id).name
                )
                .join(", ");
            this.notification.add(
                _t(
                    'The Point of Sale can not process the scanned barcode, as it matches multiple products: "%s".',
                    productNamesString
                ),
                {
                    type: "warning",
                    title: _t(
                        'Multiple Products Matching Barcode: "%s".',
                        code.base_code
                    ),
                }
            );
            return;
        }
        await this.pos.addLineToCurrentOrder(
            {product_id: product},
            {code},
            product.needToConfigure()
        );
    },
    async _getProductByLotBarcode(base_code) {
        const foundLotIds = await this._searchLotProduct(base_code.code);
        if (foundLotIds.length === 1) {
            let product = this.pos.models["product.product"].get(
                foundLotIds[0].product_id
            );
            if (!product) {
                product = await this.pos.data.searchRead(
                    "product.product",
                    [
                        ["id", "=", foundLotIds[0].product_id],
                        ["available_in_pos", "=", true],
                    ],
                    this.pos.data.fields["product.product"]
                );
                if (product.length > 1) {
                    product = product[0];
                    await this.pos.processProductAttributes();
                }
            }
            return product;
        } else if (foundLotIds.length > 1) {
            return foundLotIds;
        }
        return false;
    },
    async _searchLotProduct(code) {
        const foundLotIds = await this.pos.data.searchRead(
            "stock.lot",
            [["name", "=", code]],
            ["id", "product_id"],
            {
                order: "id desc",
                limit: 2,
            }
        );
        return foundLotIds;
    },
});
