/*
Copyright (C) 2022-Today KMEE (https://kmee.com.br)
 License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
*/

odoo.define("pos_crm.models", function (require) {
    "use strict";

    const {Order} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    const core = require("web.core");

    const _t = core._t;

    const PosAskCustomerOrder = (Order) =>
        class PosAskCustomerOrder extends Order {
            constructor() {
                super(...arguments);
                this.is_pos_crm_checked = this.is_pos_crm_checked || null;
                this.partner_vat = this.partner_vat || null;
                this.save_to_db();
            }
            // @override
            init_from_JSON(json) {
                super.init_from_JSON(...arguments);
                this.is_pos_crm_checked = json.is_pos_crm_checked || null;
                this.partner_vat = json.partner_vat || null;
                if (json.partner_id) {
                    this.partner_vat = this.pos.db.get_partner_by_id(
                        json.partner_id
                    ).vat;
                }
            }
            // @override
            export_for_printing() {
                const json = super.export_for_printing(...arguments);
                json.is_pos_crm_checked = this.is_pos_crm_checked;
                json.partner_vat = this.partner_vat;
                return json;
            }
            // @override
            export_as_JSON() {
                const json = super.export_as_JSON(...arguments);
                json.is_pos_crm_checked = this.is_pos_crm_checked;
                json.partner_vat = this.partner_vat;
                return json;
            }
            // @override
            set_partner(partner) {
                super.set_partner(partner);
                this.assert_editable();
                if (partner) {
                    this.partner_vat = partner.vat || null;
                } else {
                    this.set_is_pos_crm_checked(false);
                }
            }
            set_is_pos_crm_checked(is_pos_crm_checked) {
                this.assert_editable();
                this.is_pos_crm_checked = is_pos_crm_checked;
            }
            is_is_pos_crm_checked() {
                return this.is_pos_crm_checked;
            }
            async ask_customer_data(component, screen) {
                if (
                    !this.get_partner() &&
                    !this.is_pos_crm_checked &&
                    this.pos.config.pos_crm_question === screen
                ) {
                    const result = await component.showPopup("AskVatPopup", {
                        title: _t("CPF/CNPJ"),
                        startingValue: 0,
                    });
                    this.set_is_pos_crm_checked(true);
                    if (result.confirmed) {
                        var partner = this.pos.db.get_partners_by_tax_id(
                            result.payload
                        )[0];
                        if (!partner) {
                            partner = this.pos.db.get_partner_by_barcode(
                                result.payload
                            );
                        }
                        // FIXME: return a new pop-up to the user select the partner;
                        if (!partner && this.pos.config.pos_crm_auto_create_partner) {
                            try {
                                const partnerId = await this.pos.env.services.rpc({
                                    model: "res.partner",
                                    method: "create_from_ui",
                                    args: [
                                        {
                                            name: result.payload,
                                            vat: result.payload,
                                        },
                                    ],
                                });
                                await this.pos.load_new_partners();
                                partner = this.pos.db.get_partner_by_id(partnerId);
                            } catch (error) {
                                // FIXME: Create a strategy to create partner offline;
                                console.log(
                                    "Create a strategy to create partner offline"
                                );
                                this.partner_vat = result.payload;
                                return false;
                            }
                        }
                        if (partner) {
                            if (this.get_partner() !== partner) {
                                this.set_partner(partner);
                            }
                            return true;
                        }
                    }
                }
            }
        };
    Registries.Model.extend(Order, PosAskCustomerOrder);
});
