/* Copyright 2026 INVITU (https://www.invitu.com)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {PosStore} from "@point_of_sale/app/store/pos_store";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    getReceiptHeaderData(order) {
        const result = super.getReceiptHeaderData(...arguments);
        if (this.config.module_pos_hr) {
            // No fallback to the current cashier: it could be another person.
            const firstname = order
                ? order.getCashierName()
                : this.get_cashier()?.firstname;
            result.cashier = firstname ? _t("Served by %s", firstname) : undefined;
        }
        return result;
    },
    getPrintingChanges(order) {
        const result = super.getPrintingChanges(...arguments);
        if (this.config.module_pos_hr) {
            result.employee_name = order.getCashierName();
        }
        return result;
    },
});
