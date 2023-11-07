/** @odoo-module **/

import {useState} from "@odoo/owl";
import {patch} from "@web/core/utils/patch";
import {PartnerDetailsEdit} from "@point_of_sale/app/screens/partner_list/partner_editor/partner_editor";

patch(PartnerDetailsEdit.prototype, {
    setup() {
        super.setup();
        this.changes = useState({
            ...this.changes,
            birthdate_date: this.props.partner.birthdate_date || null,
        });
    },
});
