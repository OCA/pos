/*
    Copyright (C) 2024 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/
import {patch} from "@web/core/utils/patch";
import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {useBarcodeReader} from "@point_of_sale/app/barcode/barcode_reader_hook";

patch(ProductScreen.prototype, {
    setup() {
        super.setup();
        useBarcodeReader({
            price_to_weight: this._barcodeProductAction,
        });
    },
});
