/** @odoo-module */

/*
    Copyright 2022 Camptocamp SA (https://www.camptocamp.com).
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
import {Product} from "@point_of_sale/app/store/models";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";

patch(Product.prototype, {
    async getAddProductOptions(code) {
        if (["serial", "lot"].includes(this.tracking)) {
            session.lots = await this.pos.getProductLots(this);
        }
        const res = await super.getAddProductOptions(code);
        session.lots = undefined;
        return res;
    },
});
