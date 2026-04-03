/** @odoo-module **/

import PartnerDetailsEdit from "point_of_sale.PartnerDetailsEdit";
import Registries from "point_of_sale.Registries";

const {useState, onMounted} = owl;

const RequiredFieldsPartnerDetailsEdit = (OriginalPartnerDetailsEdit) =>
    class extends OriginalPartnerDetailsEdit {
        setup() {
            super.setup();
            this.changes = useState({
                ...this.changes,
                pos_config_id: this.env.pos.config.id || null,
            });

            const required_fields = this.env.pos.config
                .res_partner_required_fields_names
                ? this.env.pos.config.res_partner_required_fields_names.split(",")
                : null;

            onMounted(() => {
                if (required_fields && required_fields.length > 0) {
                    const baseElement = document.querySelector(
                        "section.partner-details"
                    );
                    required_fields.forEach((field_name) => {
                        const inputField = baseElement.querySelector(
                            `input[name="${field_name}"]`
                        );
                        if (inputField) {
                            inputField.setAttribute("required", true);
                        }
                    });
                }
            });
        }
    };

Registries.Component.extend(PartnerDetailsEdit, RequiredFieldsPartnerDetailsEdit);

export default PartnerDetailsEdit;
