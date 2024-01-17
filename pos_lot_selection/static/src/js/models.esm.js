/** @odoo-module */
/*
    Copyright 2023 Dixmit
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/

import {Orderline, Product} from "@point_of_sale/app/store/models";

import {patch} from "@web/core/utils/patch";
patch(Product.prototype, {
    getAddProductOptions() {
        this.pos.selectedProduct = this;
        return super.getAddProductOptions(...arguments);
    },
});
patch(Orderline.prototype, {
    editPackLotLines() {
        this.pos.selectedProduct = this.product;
        return super.editPackLotLines(...arguments);
    },
});
