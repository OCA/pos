/** @odoo-module */

import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
const {DateTime} = luxon;
import {PosStore} from "@point_of_sale/app/store/pos_store";
import {patch} from "@web/core/utils/patch";
import {parseDate} from "@web/core/l10n/dates";
import {_t} from "@web/core/l10n/translation";
import {sprintf} from "@web/core/utils/strings";

patch(PosStore.prototype, {
    /**
     * Compute the partner's exact age based on birthdate.
     *
     * @param {String} birthdate_date - The birth date in string format (YYYY-MM-DD).
     * @returns {Number} - The calculated age.
     */
    evaluatePartnerAge(birthdate_date) {
        if (!birthdate_date) return 0;
        const birthDate = parseDate(birthdate_date);
        if (!birthDate.isValid) return 0; // Handle invalid dates

        const now = DateTime.now();
        let age = now.year - birthDate.year;

        // Adjust age if the birthday hasn't occurred yet this year
        const hasBirthdayPassed =
            now.month > birthDate.month ||
            (now.month === birthDate.month && now.day >= birthDate.day);
        if (!hasBirthdayPassed) {
            age--;
        }
        return age;
    },

    /**
     * Check if the partner is underage based on the company's age warning threshold.
     *
     * @param {Object} partner - The partner object.
     * @returns {Boolean} - True if the partner is underage, otherwise false.
     */
    isUnderagePartner(birthdate) {
        return (
            birthdate && this.evaluatePartnerAge(birthdate) <= this.company.age_warning
        );
    },

    /**
     * Get the partner's age as a formatted string.
     *
     * @param {Object} partner - The partner object.
     * @returns {String} - Formatted age string, e.g., "(25 y)".
     */
    formatPartnerAge(partner) {
        if (!partner || !partner.birthdate_date) return "";
        return sprintf(_t("(%s y)"), this.evaluatePartnerAge(partner.birthdate_date));
    },
    async ageRestrictionDialog(partner) {
        if (!partner || !partner.birthdate_date) return false;
        if (this.isUnderagePartner(partner.birthdate_date)) {
            await this.env.services.dialog.add(AlertDialog, {
                title: _t("Age Restriction"),
                body: sprintf(
                    _t("%s is under %s years old!"),
                    partner.name,
                    this.company.age_warning
                ),
            });
        }
    },
});
