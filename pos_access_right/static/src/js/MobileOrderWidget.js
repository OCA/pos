odoo.define("pos_access_right.MobileOrderWidget", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const MobileOrderWidget = require("point_of_sale.MobileOrderWidget");

    const PosMobileOrderWidget = (OriginalMobileOrderWidget) =>
        class extends OriginalMobileOrderWidget {
            get hasPaymentControlRights() {
                return this.env.pos.user.hasGroupPayment;
            }
        };

    Registries.Component.extend(MobileOrderWidget, PosMobileOrderWidget);

    return MobileOrderWidget;
});
