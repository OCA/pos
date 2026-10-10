/** @odoo-module **/
/*
    Copyright (C) 2023-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/

import {Component} from "@odoo/owl";
import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {usePos} from "@point_of_sale/app/store/pos_hook";

class NewlineButton extends Component {
    setup() {
        super.setup();
        this.pos = usePos();
    }

    get currentOrder() {
        return this.pos.get_order();
    }

    async onClick() {
        this.currentOrder.create_new_line = !this.currentOrder.create_new_line;
        this.render(true);
    }
}
NewlineButton.template = "NewlineButton";

ProductScreen.addControlButton({
    component: NewlineButton,
    condition: function () {
        return this.pos.get_order().get_orderlines().length !== 0;
    },
});
