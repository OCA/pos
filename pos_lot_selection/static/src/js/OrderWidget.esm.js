/** @odoo-module */

/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/
import {Orderline} from "@point_of_sale/app/store/models";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";

patch(Orderline.prototype, {
    async editPackLotLines() {
        session.lots = await this.pos.getProductLots(this.product);
        const res = await super.editPackLotLines(...arguments);
        session.lots = undefined;
        return res;
    },
});
