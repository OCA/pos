/* Copyright (C) 2020-Today Akretion (https://www.akretion.com)
    @author Raphaël Reverdy (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_backend_partner.ProductScreen", function (require) {
    "use strict";
    var Registries = require("point_of_sale.Registries");
    var ProductScreen = require("point_of_sale.ProductScreen");
    var PaymentScreen = require("point_of_sale.PaymentScreen");
    var tools = require("pos_backend_communication.tools");

    var pos_instance = undefined;
    var _t = undefined;
    var action_url = undefined;

    async function open_backend(message, session) {
        // Lookup action_id
        action_url =
            action_url ||
            session
                .rpc("/web/action/load", {
                    action_id: "pos_backend_partner.action_select_partner_pos",
                })
                .then(function (e) {
                    return e.id;
                });

        return action_url.then(function (action_id) {
            var url = "/web#view_type=list&model=res.partner&action=" + action_id;
            var msg = {type: "partner.choose"};
            tools.open_page(url, msg, "partner");
        });
    }

    function set_client(message) {
        var data = message.data;
        var partner_info = {
            id: parseInt(data.partner_id, 10),
            name: data.name,
            lang: data.lang,
            property_account_position_id: data.property_account_position_id,
            property_product_pricelist: data.property_product_pricelist,
            country_id: [],
        };
        pos_instance.get("selectedOrder").set_client(partner_info);
        pos_instance.db.add_partners([partner_info]);
        pos_instance.get("selectedOrder").updatePricelist(partner_info);
        alert(_t("Customer set")); // Try to get the focus back
    }
    tools.callbacks["partner.partner_selected"] = set_client;

    const PBPProductScreen = (ProductScreen) =>
        class PBPProductScreen extends ProductScreen {
            async _onClickCustomer() {
                // No super !
                pos_instance = this.env.pos;
                _t = this.env._t;
                open_backend(null, this.env.session);
            }
        };

    const PBPPaymentScreen = (PaymentScreen) =>
        class PBPPaymentScreen extends PaymentScreen {
            async selectClient() {
                // No super !
                pos_instance = this.env.pos;
                _t = this.env._t;
                open_backend(null, this.env.session);
            }
        };
    Registries.Component.extend(ProductScreen, PBPProductScreen);
    Registries.Component.extend(PaymentScreen, PBPPaymentScreen);
});

odoo.define("pos_backend_partner.prevent_model_load", function (require) {
    "use strict";
    // Prevent res.partner to be loaded at startup of the POS
    // we load partners from the back office

    // huge perf improvement server side AND client side AND network side
    // we don't need it since the client is picked from the backoffice
    var pos_models = require("point_of_sale.models");
    var partnerModelId = null;
    pos_models.PosModel.prototype.models.some(function (m, idx) {
        if (m.model !== "res.partner") return false;
        partnerModelId = idx; // Got her !
        return true; // Exit early
    });
    if (partnerModelId) {
        pos_models.PosModel.prototype.models.splice(partnerModelId, 1);
        // Remove the model without changing the reference to the array
    }
});
