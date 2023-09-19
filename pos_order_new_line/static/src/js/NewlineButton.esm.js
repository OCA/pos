/*
    Copyright (C) 2023-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/

odoo.define("pos_order_new_line.NewlineButton", function (require) {
    const PosComponent = require("point_of_sale.PosComponent");
    const ProductScreen = require("point_of_sale.ProductScreen");
    const {useListener} = require("@web/core/utils/hooks");
    const Registries = require("point_of_sale.Registries");

    class NewlineButton extends PosComponent {
        setup() {
            super.setup();
            useListener("click", this.onClick);
        }

        get currentOrder() {
            return this.env.pos.get_order();
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
            return this.env.pos.get_order().get_orderlines().length !== 0;
        },
    });

    Registries.Component.add(NewlineButton);

    return NewlineButton;
});
