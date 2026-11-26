/* Copyright 2024 Hunki Enterprises BV
 * Copyright 2026 Trobz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 */
import {PosOrderline} from "@point_of_sale/app/models/pos_order_line";
import {patch} from "@web/core/utils/patch";

patch(PosOrderline.prototype, {
    set_quantity(quantity, keep_price) {
        const depositLine = this.container_deposit_line_id;
        const result = super.set_quantity(...arguments);
        if (result === true && depositLine && depositLine.qty !== this.qty) {
            depositLine.set_quantity(this.qty, keep_price);
        }
        return result;
    },
    can_be_merged_with(orderline) {
        /**
         * Never merge container deposit lines.
         **/
        if (this.is_container_deposit || orderline.is_container_deposit) {
            return false;
        }
        return super.can_be_merged_with(...arguments);
    },
});
