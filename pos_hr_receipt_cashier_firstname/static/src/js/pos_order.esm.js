/* Copyright 2026 INVITU (https://www.invitu.com)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {PosOrder} from "@point_of_sale/app/models/pos_order";
import {patch} from "@web/core/utils/patch";

patch(PosOrder.prototype, {
    getCashierName() {
        if (!this.config.module_pos_hr) {
            return super.getCashierName(...arguments);
        }
        return this.employee_id?.firstname || "";
    },
});
