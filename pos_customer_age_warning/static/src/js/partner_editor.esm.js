/** @odoo-module */

import {_t} from "@web/core/l10n/translation";
import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {PartnerDetailsEdit} from "@point_of_sale/app/screens/partner_list/partner_editor/partner_editor";
import {patch} from "@web/core/utils/patch";
import {sprintf} from "@web/core/utils/strings";

patch(PartnerDetailsEdit.prototype, {
    async checkAgeRestriction(partnerName) {
        await this.env.services.dialog.add(AlertDialog, {
            title: _t("Age Restriction"),
            body: sprintf(
                _t(
                    "%s is under %s years old!",
                    partnerName,
                    this.pos.company.age_warning
                )
            ),
        });
    },
    async saveChanges() {
        const {partner} = this.props;
        const {birthdate_date = partner.birthdate_date, name = partner.name} =
            this.changes;
        if (this.pos.isUnderagePartner(birthdate_date)) {
            await this.checkAgeRestriction(name);
        }
        return super.saveChanges(...arguments);
    },
});
