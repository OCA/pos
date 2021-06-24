/* Copyright 2021 Initos Gmbh
   License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("point_of_sale.OrderReceiptWithoutPrice", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const OrderReceipt = require("point_of_sale.OrderReceipt");

    class OrderReceiptWithoutPrice extends OrderReceipt {
        constructor() {
            super(...arguments);
        }
    }

    OrderReceiptWithoutPrice.template = "point_of_sale.OrderReceiptWithoutPrice";
    Registries.Component.add(OrderReceiptWithoutPrice);
    return OrderReceiptWithoutPrice;
});
