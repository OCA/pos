/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Pierre Verkest <pierreverkest84@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 */
odoo.define("pos_customers_required_fields.screens", function (require) {
    "use strict";

    var screens = require("point_of_sale.screens");

    screens.PaymentScreenWidget.include({
        missing_customer_fields: function () {
            const customer = this.pos.get_order().get_client();
            if (!customer || this.pos.config.res_partner_required_fields_names === "") {
                // In case customer is not required there are no missing fields
                // there are some other check that ensure if customer is
                // required or not, it's not the intent of this method to decide
                return [];
            }
            return this.pos.config.res_partner_required_fields_names
                .split(",")
                .filter(function (name) {
                    if (!customer[name]) {
                        return true;
                    }
                    return false;
                });
        },
        order_is_valid: function (force_validation) {
            const missing_fields = this.missing_customer_fields();
            if (missing_fields.length > 0) {
                this.gui.show_popup("error", {
                    title: _t("Missing customer data"),
                    body:
                        _t(
                            "Some data on the customer you picked are missing. Use the customer screen to edit: "
                        ) + missing_fields,
                });
                return false;
            }
            return this._super.apply(this, arguments);
        },
    });

    screens.ClientListScreenWidget.include({
        display_client_details: function (visibility, partner, clickpos) {
            this._super.apply(this, arguments);
            var inputs = this.$("div.client-details-contents input");
            if (visibility === "edit") {
                const required_fields =
                    this.pos.config.res_partner_required_fields_names.split(",");
                _.each(inputs, function (input_element) {
                    if (required_fields.indexOf(input_element.name) >= 0) {
                        $(input_element).prop("required", true);
                    }
                });
            }
        },
    });
});
