/** @odoo-module **/
/*
    Copyright (C) 2023-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/
import {ControlButtons} from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons";
import {patch} from "@web/core/utils/patch";

patch(ControlButtons.prototype, {
    get currentOrder() {
        return this.pos.get_order();
    },
    async onClickNewlineButton() {
        this.currentOrder.create_new_line = !this.currentOrder.create_new_line;
    },
});
