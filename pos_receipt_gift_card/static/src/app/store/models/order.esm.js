/** @odoo-module */

import {Order} from "@point_of_sale/app/store/models";
import {patch} from "@web/core/utils/patch";

patch(Order.prototype, {
    async get_gift_card_by_order(domain) {
        return this.pos.orm.searchRead("loyalty.card", domain, [
            "id",
            "code",
            "points_display",
        ]);
    },

    export_for_printing() {
        const result = super.export_for_printing(...arguments);
        result.giftCardData = this.giftCardData;
        return result;
    },
});
