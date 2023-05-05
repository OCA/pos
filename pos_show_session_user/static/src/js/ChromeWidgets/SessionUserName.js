odoo.define("pos_show_session_user.SessionUserName", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class SessionUserName extends PosComponent {
        get username() {
            return this.env.session.name || "";
        }
    }

    SessionUserName.template = "SessionUserName";

    Registries.Component.add(SessionUserName);

    return SessionUserName;
});
