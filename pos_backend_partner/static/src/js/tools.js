odoo.define("pos_backend_partner.tools", function (require) {
    "use strict";
    const {_t} = require("web.core");
    var tools = require("pos_backend_communication.tools");

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
        window.posmodel.get("selectedOrder").set_client(partner_info);
        window.posmodel.db.add_partners([partner_info]);
        window.posmodel.get("selectedOrder").updatePricelist(partner_info);
        alert(_t("Customer set")); // Try to get the focus back
    }
    tools.callbacks["partner.partner_selected"] = set_client;
});
