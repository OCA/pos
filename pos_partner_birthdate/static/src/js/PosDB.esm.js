/** @odoo-module **/
import {PosDB} from "@point_of_sale/app/store/db";
import {formatDate} from "@web/core/l10n/dates";
import {patch} from "@web/core/utils/patch";
const {DateTime} = luxon;

patch(PosDB.prototype, {
    _partner_search_string(partner) {
        var result = super._partner_search_string(partner);
        if (partner.birthdate_date) {
            const formattedDate = formatDate(
                DateTime.fromJSDate(new Date(partner.birthdate_date)).setZone("UTC")
            );
            result =
                result.substr(0, result.length - 1) +
                "|" +
                formattedDate +
                "|" +
                formattedDate
                    .replaceAll("/", "")
                    .replaceAll(".", "")
                    .replaceAll("-", "") +
                "\n";
        }
        return result;
    },
});
