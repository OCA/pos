/* License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {PosOrder} from "@point_of_sale/app/models/pos_order";
import {patch} from "@web/core/utils/patch";

patch(PosOrder.prototype, {
    /**
     * Override set_partner to trigger auto-apply credit when partner changes
     */
    set_partner(partner) {
        const oldPartner = this.get_partner();
        super.set_partner(...arguments);

        // If partner changed and we're on payment screen, trigger auto-apply
        if (partner && partner !== oldPartner && this.pos) {
            // Check if we have any auto-apply credit payment methods
            const config = this.pos.config;
            if (!config) {
                return;
            }

            const paymentMethods = this.pos.models["pos.payment.method"];
            if (!paymentMethods) {
                return;
            }

            const hasAutoCreditMethod = paymentMethods.some(
                (pm) =>
                    pm.use_payment_terminal === "credit" &&
                    pm.auto_apply_credit_amount &&
                    config.payment_method_ids.includes(pm.id)
            );

            if (hasAutoCreditMethod && partner.credit_amount > 0) {
                // Trigger auto-apply on payment screen if it's active
                const currentScreen = this.pos.mainScreen;
                if (currentScreen && currentScreen.component?.autoApplyCreditPayment) {
                    // Small delay to ensure all updates are processed

                    setTimeout(() => {
                        currentScreen.component.autoApplyCreditPayment();
                    }, 50);
                }
            }
        }
    },
});
