/** @odoo-module */
/*
    Copyright 2024 Dixmit
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

import {ControlButtons} from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons";
import {patch} from "@web/core/utils/patch";

patch(ControlButtons.prototype, {
    onClickCopyOrderButton() {
        var order = this.pos.get_order();
        this.pos.copy_on_new_order(order);
        this.pos.showScreen("ProductScreen");
    },
});
