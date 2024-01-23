/** @odoo-module **/
const {useState} = owl;
import PartnerDetailsEdit from "point_of_sale.PartnerDetailsEdit";
import Registries from "point_of_sale.Registries";

const PartnerDetailsEditBirthdate = (OriginalPartnerDetailsEdit) =>
    class extends OriginalPartnerDetailsEdit {
        setup() {
            super.setup();
            this.changes = useState({
                ...this.changes,
                birthdate_date: this.props.partner.birthdate_date || null,
            });
        }
    };

Registries.Component.extend(PartnerDetailsEdit, PartnerDetailsEditBirthdate);
