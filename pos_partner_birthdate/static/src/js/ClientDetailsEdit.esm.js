/** @odoo-module **/
import {PartnerDetailsEdit} from "@point_of_sale/app/screens/partner_list/partner_editor/partner_editor";
import {patch} from "@web/core/utils/patch";

patch(PartnerDetailsEdit.prototype, {
    setup() {
        super.setup(...arguments);
        this.changes.birthdate_date = this.props.partner.birthdate_date || null;
    },
    _today() {
        return new Date().toISOString().split("T")[0];
    },
});
