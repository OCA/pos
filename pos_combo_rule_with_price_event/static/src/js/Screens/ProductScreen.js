/*
    Copyright (C) 2023 KMEE (https://kmee.com.br)
    @author: Felipe Zago <felipe.zago@kmee.com.br>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_combo_rule_with_price_event.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const ComboRuleWithPriceEventProductScreen = (Product) =>
        class extends Product {
            _setComboDiscount(orderLine, discountAmount) {
                if (orderLine.product.product_event_id) {
                    // We look for the smaller price between the combo discount
                    // and the price event
                    const finalAmount = orderLine.product.origin_price - discountAmount;
                    if (finalAmount >= orderLine.price) {
                        return;
                    }

                    orderLine.set_unit_price(orderLine.product.origin_price);
                }

                super._setComboDiscount(orderLine, discountAmount);
            }
        };

    Registries.Component.extend(ProductScreen, ComboRuleWithPriceEventProductScreen);
    return ProductScreen;
});
