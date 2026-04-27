/** @odoo-module **/
import {PartnerLine} from "@point_of_sale/app/screens/partner_list/partner_line/partner_line";
import {formatDate, parseDate} from "@web/core/l10n/dates";
import {patch} from "@web/core/utils/patch";

patch(PartnerLine.prototype, {
    get formatedBirthdate() {
        if (!this.props.partner.birthdate_date) {
            return "";
        }
        return formatDate(parseDate(this.props.partner.birthdate_date));
    },
});
