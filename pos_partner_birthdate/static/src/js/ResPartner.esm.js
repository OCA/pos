/** @odoo-module **/
import {ResPartner} from "@point_of_sale/app/models/res_partner";
import {formatDate, parseDate} from "@web/core/l10n/dates";
import {patch} from "@web/core/utils/patch";

patch(ResPartner.prototype, {
    get searchString() {
        let str = super.searchString;
        if (this.birthdate_date) {
            let formattedDate = "";
            let rawDate = "";
            if (typeof this.birthdate_date === "string") {
                const parsedBirthdate = parseDate(this.birthdate_date);
                formattedDate = parsedBirthdate ? formatDate(parsedBirthdate) : "";
                rawDate = this.birthdate_date;
            } else {
                formattedDate = formatDate(this.birthdate_date);
                rawDate = this.birthdate_date.toISODate?.() || "";
            }
            if (!formattedDate) {
                return str;
            }
            const compactDate = formattedDate.replace(/[/.-]/g, "");
            str += ` ${formattedDate} ${compactDate} ${rawDate}`;
        }
        return str;
    },
});
