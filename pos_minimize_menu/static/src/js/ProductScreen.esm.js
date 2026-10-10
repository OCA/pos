/** @odoo-module **/

/*
    Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
*/

import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {patch} from "@web/core/utils/patch";

patch(ProductScreen.prototype, {
    get importantControlButtons() {
        if (window.odoo && window.odoo.isTourReady) {
            // Bypass button shrinking during tours to avoid test breakages
            return this.controlButtons;
        }
        var importantButtons = [];
        var important_names = this.pos.config.iface_important_buttons || "";
        for (const button of this.controlButtons) {
            if (important_names.includes(button.name)) {
                importantButtons.push(button);
            }
        }
        return importantButtons;
    },
});
