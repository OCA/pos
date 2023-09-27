/*
 Copyright 2023 Ooops404
 License AGPL-3 - See https://www.gnu.org/licenses/agpl-3.0.html
*/

odoo.define("pos_customer_required_fields.ClientDetailsEdit", function (require) {
    "use strict";

    const {_t} = require("web.core");
    const ClientDetailsEdit = require("point_of_sale.ClientDetailsEdit");
    const Registries = require("point_of_sale.Registries");

    const PosClientDetailsEdit = (ClientDetailsEdit) =>
        class extends ClientDetailsEdit {
            constructor() {
                super(...arguments);
                this.rpc({
                    model: "res.partner",
                    method: "get_required_customer_fields",
                    args: [],
                }).then((res) => (this.partner_required_fields = res));
            }

            saveChanges() {
                var self = this;
                const processedChanges = {};
                for (const [key, value] of Object.entries(this.changes)) {
                    if (this.intFields.includes(key)) {
                        processedChanges[key] = parseInt(value) || false;
                    } else {
                        processedChanges[key] = value;
                    }
                }
                var verified = true;
                _.each(self.partner_required_fields, function (field_name) {
                    if (
                        (!self.props.partner[field_name] &&
                            !processedChanges[field_name]) ||
                        processedChanges[field_name] === ""
                    ) {
                        verified = false;
                        var field_label = $("[name='" + field_name +"']").prev().text() ;
                        return self.showPopup("ErrorPopup", {
                            title: _t("Field " + field_label + " is required"),
                        });
                    }
                });
                if (verified == true) {
                    super.saveChanges();
                }
            }
        };

    Registries.Component.extend(ClientDetailsEdit, PosClientDetailsEdit);

    return ClientDetailsEdit;
});
