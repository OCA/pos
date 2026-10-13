import {PartnerList} from "@point_of_sale/app/screens/partner_list/partner_list";
import {patch} from "@web/core/utils/patch";

patch(PartnerList.prototype, {
    /**
     * Override to trigger auto-apply credit after partner selection
     */
    async clickPartner(partner) {
        const result = await super.clickPartner(partner);

        // Trigger auto-apply credit payment if on payment screen
        const currentScreen = this.pos.get_order()?.get_screen_data();
        if (currentScreen && currentScreen.name === "PaymentScreen") {
            // Give a small delay to ensure order updates are complete

            setTimeout(() => {
                const paymentScreen = this.pos.mainScreen?.component;
                if (
                    paymentScreen &&
                    typeof paymentScreen.autoApplyCreditPayment === "function"
                ) {
                    paymentScreen.autoApplyCreditPayment();
                }
            }, 100);
        }

        return result;
    },
});
