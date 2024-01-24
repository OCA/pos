/** @odoo-module **/
import {PartnerDetailsEdit} from "@point_of_sale/app/screens/partner_list/partner_editor/partner_editor";
import {patch} from "@web/core/utils/patch";

patch(PartnerDetailsEdit.prototype, {
    setup() {
        super.setup(...arguments);
        this.changes.lastname2 = this.props.partner.lastname2;
    },
    checkPartnerPersonName() {
        /* We add this hook in order to check second last name later */
        return super.checkPartnerPersonName() && !this.changes.lastname2;
    },
    _getLastName(changes) {
        var lastname = super._getLastName(...arguments);
        return [lastname, changes.lastname2].filter((w) => Boolean(w)).join(" ");
    },
});
