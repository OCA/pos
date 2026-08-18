/**
 *  Copyright 2026 Bernat Obrador APSL-Nagarro
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 */

import {ClosePosPopup} from "@point_of_sale/app/components/popups/closing_popup/closing_popup";
import {patch} from "@web/core/utils/patch";

patch(ClosePosPopup.prototype, {
    get canSeeClosingAmounts() {
        return this.pos.canSeeClosingAmounts;
    },
    getInitialState() {
        const initialState = super.getInitialState(...arguments);
        if (!this.canSeeClosingAmounts) {
            for (const pm of this.props.non_cash_payment_methods) {
                if (pm.type === "bank" && initialState.payments[pm.id]) {
                    initialState.payments[pm.id].counted = "0";
                }
            }
        }
        return initialState;
    },
    autoFillCashCount() {
        if (!this.canSeeClosingAmounts) {
            return;
        }
        return super.autoFillCashCount(...arguments);
    },
    autoFillPMCount(paymentId) {
        if (!this.canSeeClosingAmounts) {
            return;
        }
        return super.autoFillPMCount(paymentId);
    },
});
