/** @odoo-module */

import {PosDB} from "@point_of_sale/app/store/db";
import {patch} from "@web/core/utils/patch";

patch(PosDB.prototype, {
    _partner_search_string(partner) {
        var str = super._partner_search_string(partner);
        if (partner.ref) {
            str = str.substr(0, str.length - 1) + "|" + partner.ref + "\n";
        }
        return str;
    },
});
