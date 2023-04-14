/*
Copyright (C) 2022-Today KMEE (https://kmee.com.br)
 License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
*/

odoo.define("pos_crm.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");
    const core = require("web.core");
    const _t = core._t;

    const _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function (attributes, options) {
            _super_order.initialize.call(this, attributes, options);
            this.customer_tax_id = this.customer_tax_id || null;
            this.save_to_db();
        },
        init_from_JSON: function (json) {
            _super_order.init_from_JSON.call(this, json);
            this.customer_tax_id = json.customer_tax_id || null;
            if (json.partner_id) {
                this.customer_tax_id = this.pos.db.get_partner_by_id(
                    json.partner_id
                ).vat;
            }
        },
        export_as_JSON: function () {
            const json = _super_order.export_as_JSON.call(this);
            json.customer_tax_id = this.customer_tax_id;
            return json;
        },
        export_for_printing: function () {
            const json = _super_order.export_for_printing.call(this);
            json.customer_tax_id = this.customer_tax_id;
            return json;
        },
        set_client: function (client) {
            _super_order.set_client.call(this, client);
            this.assert_editable();
            if (client) {
                this.customer_tax_id = client.vat || null;
            }
        },
        ask_customer_data: async function (component, screen) {
            const client = this.get_client();
            const posConfig = this.pos.config;

            if (!client && posConfig.pos_crm_question === screen) {
                const result = await component.showPopup("TaxIdPopup", {
                    title: _t("Customer Tax ID"),
                    startingValue: 0,
                });

                if (result.confirmed) {
                    let partner =
                        this.pos.db.get_partners_by_tax_id(result.payload) ||
                        this.pos.db.get_partner_by_barcode(result.payload);

                    if (partner.length === 0 && posConfig.pos_crm_auto_create_partner) {
                        try {
                            const partnerId = await this.pos.rpc({
                                model: "res.partner",
                                method: "create_from_ui",
                                args: [{name: result.payload, vat: result.payload}],
                            });

                            await this.pos.load_new_partners();
                            partner = this.pos.db.get_partner_by_id(partnerId);
                        } catch (error) {
                            console.error(
                                "Error creating partner. It is not possible to complete the operation when offline",
                                error
                            );
                            return false;
                        }

                        if (partner && client !== partner) {
                            this.set_client(partner);
                        }
                    } else {
                        this.customer_tax_id = result.payload;
                    }
                }
            }
        },
    });
});
