odoo.define("pos_backend_partner.partner_back", function (require) {
    "use strict";
    var translation = require("web.translation");
    var _t = translation._t;

    var tools = require("pos_backend_communication.back");

    if (tools.is_tied_to_pos()) {
        tools.callbacks["partner.choose"] = function () {
            // Get focus with alert
            // TODO: replace with notifications
            alert(_t("Choose a customer"));
        };
        // Tell the POS we are ready to receive
        tools.sendMessage({type: "partner.ready"});
    }
});
