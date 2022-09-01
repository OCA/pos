/*
Copyright (C) 2022-Today KMEE (https://kmee.com.br)
 License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
*/

odoo.define("pos_crm.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");
    const core = require("web.core");

    const _t = core._t;

    //    Models.load_fields("pos.order", ["is_pos_crm_checked"]);

    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function (attributes, options) {
            _super_order.initialize.apply(this, arguments, options);
            this.is_pos_crm_checked = this.is_pos_crm_checked || null;
            this.partner_vat = this.partner_vat || null;
            this.save_to_db();
        },
        init_from_JSON: function (json) {
            _super_order.init_from_JSON.apply(this, arguments);
            this.is_pos_crm_checked = json.is_pos_crm_checked || null;
            this.partner_vat = json.partner_vat || null;
        },
        export_for_printing: function () {
            var json = _super_order.export_for_printing.apply(this, arguments);
            json.is_pos_crm_checked = this.is_pos_crm_checked;
            json.partner_vat = this.partner_vat;
            return json;
        },
        // TODO: Export from json!
        set_client: function (client) {
            _super_order.set_client.apply(this, arguments);
            this.assert_editable();
            if (client) {
                this.partner_vat = client.vat || null;
            }
        },
        set_is_pos_crm_checked: function (is_pos_crm_checked) {
            this.assert_editable();
            this.is_pos_crm_checked = is_pos_crm_checked;
        },
        is_is_pos_crm_checked: function () {
            return this.is_pos_crm_checked;
        },
        ask_customer_data: async function (component, screen) {
            if (
                !this.get_client() &&
                !this.is_pos_crm_checked &&
                this.pos.config.pos_crm_question === screen
            ) {
                const result = await component.showPopup("TextInputPopup", {
                    title: _t("Customer code or Tax ID?"),
                });
                this.set_is_pos_crm_checked(true);
                if (result.confirmed) {
                    var partner = this.pos.db.get_partners_by_tax_id(result.payload)[0];
                    // FIXME: return a new pop-up to the user select the partner;
                    if (!partner && this.pos.config.pos_crm_auto_create_partner) {
                        try {
                            const partnerId = await this.pos.rpc({
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
                            console.log("Create a strategy to create partner offline");
                            this.partner_vat = result.payload;
                            return false;
                        }
                    }
                    if (!partner) {
                        partner = this.pos.db.get_partner_by_barcode(result.payload);
                    }
                    if (partner) {
                        if (this.get_client() !== partner) {
                            this.set_client(partner);
                            this.set_pricelist(
                                _.findWhere(this.pos.pricelists, {
                                    id: partner.property_product_pricelist[0],
                                }) || this.pos.default_pricelist
                            );
                        }
                        return true;
                    }
                }
            }
        },
    });
});
