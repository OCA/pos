/*
    Copyright (C) 2023 KMEE (https://kmee.com.br)
    @author: Felipe Zago <felipe.zago@kmee.com.br>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/
odoo.define("pos_stock_crap.StockScrapButton", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");
    const {useListener} = require("web.custom_hooks");

    class StockScrapButton extends PosComponent {
        setup() {
            useListener("click", () => this.showPopup("StockScrapPopup", {}));
        }
    }

    StockScrapButton.template = "StockScrapButton";

    ProductScreen.addControlButton({
        component: StockScrapButton,
        condition: function () {
            return true;
        },
    });

    Registries.Component.add(StockScrapButton);

    return StockScrapButton;
});
