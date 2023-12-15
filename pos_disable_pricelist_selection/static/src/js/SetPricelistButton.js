odoo.define("pos_disable_pricelist_selection.SetPricelistButton", function (require) {
    "use strict";

    const SetPricelistButton = require("point_of_sale.SetPricelistButton");
    const Registries = require("point_of_sale.Registries");

    const SetPricelistButtonSelect = (SetPricelistButton) =>
        class extends SetPricelistButton {
            async onClick() {
                // Lets use selectable_pricelists instead of pricelists
                const original_pricelists = this.env.pos.pricelists;
                this.env.pos.pricelists = this.env.pos.selectable_pricelists;
                super.onClick();
                this.env.pos.pricelists = original_pricelists;
            }
        };

    Registries.Component.extend(SetPricelistButton, SetPricelistButtonSelect);

    return SetPricelistButtonSelect;
});
