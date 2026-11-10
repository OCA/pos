// @odoo-module

import {PosOrder} from "@point_of_sale/app/models/pos_order";
import {patch} from "@web/core/utils/patch";

patch(PosOrder.prototype, {
    get_payment_method_of_change_policy() {
        const lines = this.payment_ids;
        if (!lines || lines.length === 0) {
            return null;
        }
        for (const line of lines) {
            const method = line.payment_method_id;
            if (method && method.change_policy === "profit_product") {
                return method;
            }
        }
        return lines[0]?.payment_method_id || null;
    },

    get_change_policy() {
        const method = this.get_payment_method_of_change_policy();
        return method?.change_policy || "cash";
    },

    get_overpaid_amount() {
        const change = this.get_change() || 0;
        return change < 0 ? Math.abs(change) : 0;
    },
});
