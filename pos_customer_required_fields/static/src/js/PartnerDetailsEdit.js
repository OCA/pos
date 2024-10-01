odoo.define("pos_customer_required_fields.PartnerDetailsEdit", function (require) {
    "use strict";

    const {useState, onMounted} = owl;
    const PartnerDetailsEdit = require("point_of_sale.PartnerDetailsEdit");
    const Registries = require("point_of_sale.Registries");

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
                        required_fields.forEach(function (field_name) {
                            var inputField = document.querySelector(
                                `input[name="${field_name.trim()}"]`
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

    return PartnerDetailsEdit;
});
