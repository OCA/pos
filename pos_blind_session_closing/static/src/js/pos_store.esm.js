/**
 *  Copyright 2026 Bernat Obrador APSL-Nagarro
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 */
import {PosStore} from "@point_of_sale/app/services/pos_store";
import {patch} from "@web/core/utils/patch";
import {user} from "@web/core/user";

patch(PosStore.prototype, {
    async processServerData() {
        await super.processServerData(...arguments);
        this._sessionUserCanSeeClosingAmounts = await user.hasGroup(
            "pos_blind_session_closing.group_pos_close_session_amounts"
        );
    },
    get canSeeClosingAmounts() {
        if (this.config?.module_pos_hr) {
            const cashier = this.getCashier?.() || this.cashier;
            if (cashier?.model?.name === "hr.employee") {
                return Boolean(cashier._can_see_closing_amounts);
            }
        }
        return Boolean(this._sessionUserCanSeeClosingAmounts);
    },
});
