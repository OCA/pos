odoo.define("pos_partner_firstname.ClientDetailsEdit", function (require) {
    "use strict";

    var ClientDetailsEdit = require("point_of_sale.ClientDetailsEdit");
    const Registries = require("point_of_sale.Registries");

    const PosClientDetailsEdit = (ClientDetailsEdit) =>
        class extends ClientDetailsEdit {
            constructor() {
                super(...arguments);
                this.partner_names_order = "last_first";
                this.rpc({
                    model: "res.partner",
                    method: "get_names_order",
                    args: [],
                }).then(function (partner_names_order) {
                    if (partner_names_order) {
                        self.partner_names_order = partner_names_order;
                    }
                });
                $(".highlight")[0].style.display = "none";
            }
            _update_client_name(checked) {
                if (!checked) {
                    var lastname = $(".lastname").val() || "";
                    var firstname = $(".firstname").val() || "";
                    var name = null;
                    if (self.partner_names_order === "last_first_comma") {
                        name = lastname + ", " + firstname;
                    } else if (self.partner_names_order === "first_last") {
                        name = firstname + " " + lastname;
                    } else {
                        name = lastname + " " + firstname;
                    }
                    $(".client-name").val(name.trim());
                }
            }
            willUnmount() {
                super.willUnmount();
                $(".highlight")[0].style.display = "block";
            }
            captureChange(event) {
                super.captureChange(event);
                var self = this;
                var checked = event.currentTarget.checked;
                if (event.target.name === "is_company") {
                    $(".is_person")
                        .toArray()
                        .forEach(function (el) {
                            $(el).css("display", !checked ? "block" : "none");
                        });
                    this.changes[event.target.name] = event.target.checked;
                }
                var clientname = $(".client-name");
                clientname.attr("readonly", !checked);
                if (!checked) {
                    self._update_client_name(checked);
                } else {
                    $(".lastname").val(clientname.val());
                    $(".firstname").val("");
                }
            }
        };
    Registries.Component.extend(ClientDetailsEdit, PosClientDetailsEdit);
    return ClientDetailsEdit;
});
