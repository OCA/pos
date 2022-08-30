odoo.define("pos_show_session_user.SessionUserName", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class SessionUserName extends PosComponent {
        get username() {
            const username = this.env.session.name;
            if (username) {
                return username;
            }
            return "";
        }
    }
    SessionUserName.template = "SessionUserName";

    Registries.Component.add(SessionUserName);

    return SessionUserName;
});
