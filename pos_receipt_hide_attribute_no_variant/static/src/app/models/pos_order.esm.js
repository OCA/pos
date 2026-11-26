/* Copyright 2026 INVITU (https://www.invitu.com)
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html). */

import {PosOrder} from "@point_of_sale/app/models/pos_order";
import {patch} from "@web/core/utils/patch";

patch(PosOrder.prototype, {
    export_for_printing() {
        const result = super.export_for_printing(...arguments);
        const lines = this.getSortedOrderlines();
        if (lines.length === result.orderlines.length) {
            result.orderlines = result.orderlines.map((data, index) => ({
                ...data,
                productName: lines[index].getReceiptProductName(),
            }));
        }
        return result;
    },
});
