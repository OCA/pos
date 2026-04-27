/** @odoo-module **/
import {ResPartner} from "@point_of_sale/app/models/res_partner";
import {formatDate, parseDate} from "@web/core/l10n/dates";
import {patch} from "@web/core/utils/patch";

patch(ResPartner.prototype, {
    get searchString() {
        let str = super.searchString;
        if (this.birthdate_date) {
            const formattedDate = formatDate(parseDate(this.birthdate_date));
            const compactDate = formattedDate.replace(/[/.-]/g, "");
            str += ` ${formattedDate} ${compactDate} ${this.birthdate_date}`;
        }
        return str;
    },
});
