/*
    Copyright (C) 2024 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/
import {patch} from "@web/core/utils/patch";
import {PosOrderline} from "@point_of_sale/app/models/pos_order_line";

patch(PosOrderline.prototype, {
    setOptions(options) {
        if (options.uiState) {
            this.uiState = {...this.uiState, ...options.uiState};
        }

        if (options.code) {
            const code = options.code;
            const blockMerge = ["weight", "quantity", "discount"];
            const product_packaging_by_barcode =
                this.models["product.packaging"].getAllBy("barcode");

            if (blockMerge.includes(code.type)) {
                this.set_quantity(code.value);
            } else if (code.type === "price") {
                this.set_unit_price(code.value);
                this.price_type = "manual";
            } else if (code.type === "price_to_weight") {
                this.set_unit_price(code.value);
                let quantity = 0;
                const barcode_price = parseFloat(code.value) || 0;
                const product_price = this.get_lst_price();
                if (product_price !== 0) {
                    quantity = barcode_price / product_price;
                }
                this.set_quantity(quantity);
                this.price_type = "manual";
            }

            if (product_packaging_by_barcode[code.code]) {
                this.set_quantity(product_packaging_by_barcode[code.code].qty);
            }
        }

        this.set_unit_price(this.price_unit);
    },
});
