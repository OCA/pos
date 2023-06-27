odoo.define("pos_loyalty_partial_redeem.ResponsiveNumberPopup", function (require) {
    const NumberPopup = require("point_of_sale.NumberPopup");
    const Registries = require("point_of_sale.Registries");

    class ResponsiveNumberPopup extends NumberPopup {}
    ResponsiveNumberPopup.template = "ResponsiveNumberPopup";

    Registries.Component.add(ResponsiveNumberPopup);

    return ResponsiveNumberPopup;
});
