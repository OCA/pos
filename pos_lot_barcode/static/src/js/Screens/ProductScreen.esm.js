/** @odoo-module **/

/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/
import {ErrorBarcodePopup} from "@point_of_sale/app/barcode/error_popup/barcode_error_popup";
import {ErrorMultiLotBarcodePopup} from "@pos_lot_barcode/js/Popups/ErrorMultiLotBarcodePopup.esm";
import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {patch} from "@web/core/utils/patch";
import {useBarcodeReader} from "@point_of_sale/app/barcode/barcode_reader_hook";

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
            return this.popup.add(ErrorBarcodePopup, {code: code.base_code});
        }
        if (product instanceof Array) {
            // If we found more than a single lot in backend, raise error
            return this.popup.add(ErrorMultiLotBarcodePopup, {
                code: code.base_code,
                products: product.map((lot) => lot.product_id[1]),
            });
        }
        // Get possible options not linked to lot selection
        const options = await product.getAddProductOptions(code);
        // Do not proceed on adding the product when no options is returned.
        // This is consistent with _clickProduct.
        if (!options) return;
        this.currentOrder.add_product(product, options);
    },
    async _getProductByLotBarcode(base_code) {
        const foundLotIds = await this._searchLotProduct(base_code.code);
        if (foundLotIds.length === 1) {
            let product = this.pos.db.get_product_by_id(foundLotIds[0].product_id[0]);
            if (!product) {
                // If product is not loaded in POS, load it
                await this.pos._addProducts([foundLotIds[0].product_id[0]]);
                // Assume that the result is unique.
                product = this.pos.db.get_product_by_id(foundLotIds[0].product_id[0]);
            }
            return product;
        } else if (foundLotIds.length > 1) {
            return foundLotIds;
        }
        return false;
    },
    async _searchLotProduct(code) {
        const foundLotIds = await this.orm.silent.call("stock.lot", "search_read", [], {
            domain: [["name", "=", code]],
            fields: ["id", "product_id"],
            order: "id desc",
            limit: 2,
        });
        return foundLotIds;
    },
});
