/** @odoo-module **/
import {PartnerLine} from "@point_of_sale/app/screens/partner_list/partner_line/partner_line";
import {formatDate} from "@web/core/l10n/dates";
import {patch} from "@web/core/utils/patch";
const {DateTime} = luxon;

patch(PartnerLine.prototype, {
    get formatedBirthdate() {
        return formatDate(
            DateTime.fromJSDate(new Date(this.props.partner.birthdate_date)).setZone(
                "UTC"
            )
        );
    },
});
