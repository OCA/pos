odoo.define("pos_tare.NumpadWidget", function (require) {
    "use strict";
    const Registries = require("point_of_sale.Registries");
    const NumpadWidget = require("point_of_sale.NumpadWidget");

    const TareNumpadWidget = (NumpadWidget_) =>
        class extends NumpadWidget_ {
            changeMode(mode) {
                if (mode === "tare") {
                    this.trigger("set-numpad-mode", {mode});
                    return;
                }
                super.changeMode(mode);
            }
        };
    Registries.Component.extend(NumpadWidget, TareNumpadWidget);
    return NumpadWidget;
});
