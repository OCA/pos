/** @odoo-module **/

import {PartnerListScreen} from "@point_of_sale/app/screens/partner_list/partner_list";
import {patch} from "@web/core/utils/patch";
import {_t} from "@web/core/l10n/translation";
import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {sprintf} from "@web/core/utils/strings";

patch(PartnerListScreen.prototype, {
    /**
     * Handles partner selection in the POS.
     * If the selected partner is underage, displays an alert.
     *
     * @param {Object} partner - The partner object being selected.
     */
    clickPartner(partner) {
        // If the same partner is selected again, proceed with the default behavior
        if (this.state.selectedPartner?.id === partner.id) {
            return super.clickPartner(partner);
        }

        // Show warning if the partner is under the age restriction
        if (this.pos.isUnderagePartner(partner)) {
            this.env.services.dialog.add(AlertDialog, {
                title: _t("Age Restriction"),
                body: sprintf(
                    _t("%s is under %s years old!"),
                    partner.name,
                    this.pos.company.age_warning
                ),
            });
        }

        return super.clickPartner(partner);
    },
});
