/*
    Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
*/
odoo.define("pos_minimize_menu.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const OverloadProductScreen = (OriginalProductScreen) =>
        class extends OriginalProductScreen {
            get importantControlButtons() {
                var importantButtons = [];
                var important_names = this.env.pos.config.iface_important_buttons || "";
                for (const button of this.controlButtons) {
                    if (important_names.includes(button.name)) {
                        importantButtons.push(button);
                    }
                }
                return importantButtons;
            }
        };

    Registries.Component.extend(ProductScreen, OverloadProductScreen);
    return ProductScreen;
});
