/** @odoo-module */

/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/

import {PosStore} from "@point_of_sale/app/store/pos_store";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";

patch(PosStore.prototype, {
    async getProductLots(product) {
        try {
            return await this.orm.silent.call(
                "stock.lot",
                "get_available_lots_for_pos",
                [product.id, session.user_companies.current_company]
            );
        } catch (error) {
            console.error(error);
            return [];
        }
    },
});
