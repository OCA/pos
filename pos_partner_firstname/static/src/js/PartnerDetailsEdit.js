odoo.define("pos_partner_firstname.PartnerDetailsEdit", function (require) {
    "use strict";

    const {_t} = require("web.core");
    const PartnerDetailsEdit = require("point_of_sale.PartnerDetailsEdit");
    const Registries = require("point_of_sale.Registries");

    const PosPartnerDetailsEdit = (PartnerDetailsEdit) =>
        class extends PartnerDetailsEdit {
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
                const checked = $(".is_company").is(":checked");
                if (!checked) {
                    if (
                        (!this.props.partner.firstname &&
                            !processedChanges.firstname) ||
                        processedChanges.firstname === "" ||
                        (!this.props.partner.lastname && !processedChanges.lastname) ||
                        processedChanges.lastname === ""
                    ) {
                        return this.showPopup("ErrorPopup", {
                            title: _t("Both customer first name and last name are required."),
                        });
                    }
                    if (
                        (!this.props.partner.name && !processedChanges.name) ||
                        processedChanges.name === ""
                    ) {
                        this.props.partner.name = this._update_partner_name(
                            processedChanges.lastname,
                            processedChanges.firstname
                        );
                    }
                } else if (
                    processedChanges.is_company &&
                    (processedChanges.firstname || processedChanges.lastname)
                ) {
                    this.changes.lastname = this.changes.firstname = undefined;
                }
                super.saveChanges();
            }
            captureChange(event) {
                super.captureChange(event);
                if (event.target.name === "is_company") {
                    const checked = event.currentTarget.checked;
                    $(".is_person")
                        .toArray()
                        .forEach(function (el) {
                            $(el).css("display", !checked ? "block" : "none");
                        });

                    this.changes[event.target.name] = checked;
                    $(".client-name").attr("readonly", !checked);
                    if (!checked) {
                        const lastname = this.props.partner.lastname
                            ? this.props.partner.lastname
                            : "";
                        const firstname = this.props.partner.firstname
                            ? this.props.partner.firstname
                            : "";
                        this.props.partner.name = this._update_partner_name(
                            lastname,
                            firstname
                        );
                    }
                }
            }
        };

    Registries.Component.extend(PartnerDetailsEdit, PosPartnerDetailsEdit);

    return PartnerDetailsEdit;
});
