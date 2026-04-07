/** @odoo-module **/

import {PartnerListScreen} from "@point_of_sale/app/screens/partner_list/partner_list";
import {patch} from "@web/core/utils/patch";

patch(PartnerListScreen.prototype, {
    /**
     * Handles partner selection in the POS.
     * If the selected partner is underage, displays an alert.
     *
     * @param {Object} partner - The partner object being selected.
     */
    async clickPartner(partner) {
        // If the same partner is selected again, proceed with the default behavior
        if (this.state.selectedPartner?.id === partner.id) {
            return super.clickPartner(partner);
        }
        await this.pos.ageRestrictionDialog(partner);
        return super.clickPartner(partner);
    },
});
