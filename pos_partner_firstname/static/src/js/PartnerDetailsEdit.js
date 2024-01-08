odoo.define("pos_partner_firstname.PartnerDetailsEdit", function (require) {
    "use strict";

    const {useState} = owl;
    const {_t} = require("web.core");
    const PartnerDetailsEdit = require("point_of_sale.PartnerDetailsEdit");
    const Registries = require("point_of_sale.Registries");

    const PosPartnerDetailsEdit = (PartnerDetailsEdit) =>
        class extends PartnerDetailsEdit {
            setup() {
                super.setup();
                this.changes = useState({
                    ...this.changes,
                    firstname: this.props.partner.firstname || null,
                    lastname: this.props.partner.lastname || null,
                    is_company: this.props.partner.is_company || false,
                });
            }
            constructor() {
                super(...arguments);
                this.rpc({
                    model: "res.partner",
                    method: "get_names_order",
                    args: [],
                }).then((res) => (this.partner_names_order = res || "last_first"));
            }
            _update_partner_name(lastname, firstname) {
                let name = null;
                if (this.partner_names_order === "last_first_comma") {
                    name = lastname + ", " + firstname;
                } else if (this.partner_names_order === "first_last") {
                    name = firstname + " " + lastname;
                } else {
                    name = lastname + " " + firstname;
                }
                return name.trim();
            }
            saveChanges() {
                const processedChanges = {};
                for (const [key, value] of Object.entries(this.changes)) {
                    if (this.intFields.includes(key)) {
                        processedChanges[key] = parseInt(value) || false;
                    } else {
                        processedChanges[key] = value;
                    }
                }
                const checked = this.changes.is_company;
                if (!checked) {
                    if (
                        (!this.props.partner.firstname &&
                            !processedChanges.firstname) ||
                        processedChanges.firstname === "" ||
                        (!this.props.partner.lastname && !processedChanges.lastname) ||
                        processedChanges.lastname === ""
                    ) {
                        return this.showPopup("ErrorPopup", {
                            title: _t("Both Customer First and Last Name Are Required"),
                        });
                    }
                    this.changes.name = this._update_partner_name(
                        processedChanges.lastname,
                        processedChanges.firstname
                    );
                    processedChanges.name = this.changes.name;
                } else if (checked) {
                    this.changes.lastname = this.changes.firstname = undefined;
                }
                super.saveChanges();
            }
        };

    Registries.Component.extend(PartnerDetailsEdit, PosPartnerDetailsEdit);

    return PartnerDetailsEdit;
});
