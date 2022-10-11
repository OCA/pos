odoo.define("pos_report_engine.PosReportsScreen", function (require) {
    "use strict";

    const {useListener} = require("web.custom_hooks");
    const Registries = require("point_of_sale.Registries");
    const ControlButtonsMixin = require("point_of_sale.ControlButtonsMixin");
    const IndependentToOrderScreen = require("point_of_sale.IndependentToOrderScreen");

    class PosReportsScreen extends ControlButtonsMixin(IndependentToOrderScreen) {
        constructor() {
            super(...arguments);
            useListener("close-screen", this.close);
        }
    }

    PosReportsScreen.template = "PosReportsScreen";

    Registries.Component.add(PosReportsScreen);

    return PosReportsScreen;
});
