/**
 *  Copyright 2026 Bernat Obrador APSL-Nagarro
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 */

import {ClosePosPopup} from "@point_of_sale/app/components/popups/closing_popup/closing_popup";
import {patch} from "@web/core/utils/patch";

patch(ClosePosPopup.prototype, {
    setup() {
        super.setup(...arguments);
        this.canSeeClosingAmounts = this.pos.user.canSeeClosingAmounts;
    },
    getInitialState() {
        const initialState = super.getInitialState(...arguments);
        if (!this.pos.user.canSeeClosingAmounts) {
            const zero = this.pos.formatCurrency(0, this.pos.config.currency_id.id, {
                noSymbol: true,
            });
            for (const payment of Object.values(initialState.payments)) {
                payment.counted = zero;
            }
        }
        return initialState;
    },
});
