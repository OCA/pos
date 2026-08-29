/** @odoo-module **/
import PartnerDetailsEdit from "point_of_sale.PartnerDetailsEdit";
import Registries from "point_of_sale.Registries";

const PartnerDetailsEditComment = (OriginalPartnerDetailsEdit) =>
    class extends OriginalPartnerDetailsEdit {
        setup() {
            super.setup();
            this.changes = {
                ...this.changes,
                pos_comment: this.props.partner.pos_comment || "",
            };
        }
    };

Registries.Component.extend(PartnerDetailsEdit, PartnerDetailsEditComment);
