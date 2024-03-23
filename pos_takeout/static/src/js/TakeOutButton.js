/** ****************************************************************************
    # Copyright 2023 KMEE INFORMATICA LTDA (http://www.kmee.com.br).
    @author: Felipe Zago Rodrigues <felipe.zago@kmee.com.br>
    License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
 *****************************************************************************/

odoo.define("pos_takeout.TakeOutButton", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const ProductScreen = require("point_of_sale.ProductScreen");
    const {useListener} = require("web.custom_hooks");
    const Registries = require("point_of_sale.Registries");

    class TakeOutButton extends PosComponent {
        setup() {
            useListener("click", this.onClick);
        }

        get currentOrder() {
            return this.env.pos.get_order();
        }

        onClick() {
            this.currentOrder.eat_here = !this.currentOrder.eat_here;
            this.render();
        }
    }
    TakeOutButton.template = "TakeOutButton";

    ProductScreen.addControlButton({
        component: TakeOutButton,
        condition: function () {
            return true;
        },
    });

    Registries.Component.add(TakeOutButton);

    return TakeOutButton;
});
