odoo.define("pos_partner_firstname.screens", function (require) {
    "use strict";
    const {parse} = require("web.field_utils");
    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const ClientDetailsEdit = require("point_of_sale.ClientDetailsEdit");

    const ClientDetailsEditFirstname = (ClientDetailsEdit) =>
        class extends ClientDetailsEdit {
            constructor() {
                super(...arguments);
                var self = this;
                this.rpc({
                    model: "res.partner",
                    method: "get_names_order",
                    args: [],
                }).then(function (partner_names_order) {
                    if (partner_names_order != false) {
                        self.partner_names_order = "last_first";
                    }
                });
            }

            mounted() {
                this.display_client_details(this.props.partner);
                super.mounted(...arguments);
            }
            willUnmount() {
                this.display_client_details(this.props.partner);
                super.willUnmount(...arguments);
            }

            _update_client_name(checked) {
                if (!checked) {
                    var lastname = $(".lastname").val() || "";
                    var firstname = $(".firstname").val() || "";
                    var name = null;
                    if (this.partner_names_order === "last_first_comma") {
                        name = lastname + ", " + firstname;
                    } else if (this.partner_names_order === "first_last") {
                        name = firstname + " " + lastname;
                    } else {
                        name = lastname + " " + firstname;
                    }
                    $(".client-name").val(name);
                }
            }

            updatePerson() {
                this.display_client_details(this.props.partner);
            }

            display_client_details(partner) {
                var self = this;
                if (!$(".is_company").is(":checked")) {
                    $(".client-name").attr("readonly", true);
                }
                $(".person")
                    .off("keyup")
                    .on("keyup", function (event) {
                        var checked = $(".is_company").is(":checked");
                        $(".client-name").attr("readonly", !checked);
                        if (!checked) {
                            self._update_client_name(checked);
                        }
                    });
                $(".is_company")
                    .off("change")
                    .on("change", function (event) {
                        this.value = this.checked;
                        if (this.name === "is_company") {
                            var checked = this.checked;
                            $(".is_person")
                                .toArray()
                                .forEach(function (el) {
                                    $(el).css("display", !checked ? "block" : "none");
                                });
                            var clientname = $(".client-name");
                            clientname.attr("readonly", !checked);
                            if (!checked) {
                                self._update_client_name(checked);
                            } else {
                                $(".lastname").val(clientname.val());
                                $(".firstname").val("");
                            }
                        }
                    });
            }
        };

    Registries.Component.extend(ClientDetailsEdit, ClientDetailsEditFirstname);

    return ClientDetailsEdit;
});
