// Copyright (C) 2021 - Today: GRAP (http://www.grap.coop)
// @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

odoo.define("pos_margin.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");

    // /////////////////////////////
    // Overload models.Order
    // /////////////////////////////
    var OrderMargin = models.Order.extend({

        get_margin: function() {
            return this.get_orderlines().reduce(
                (margin, line) => margin += line.get_margin(), 0
            )
            return margin;
        },

        get_margin_rate: function(){
            var priceWithoutTax = this.get_total_without_tax();
            return priceWithoutTax ? ((this.get_margin()) / priceWithoutTax) * 100 : 0;
        },
    });

    models.Order = OrderMargin;

    // /////////////////////////////
    // Overload models.OrderLine
    // /////////////////////////////
    var OrderLineMargin = models.Orderline.extend({

        get_purchase_price: function () {
            // Overload the function to use another field that the default standard_price
            return this.product.standard_price;
        },

        get_margin: function () {
            return this.get_all_prices().priceWithoutTax - (
                this.quantity * this.get_purchase_price()
            );
        },

        get_margin_rate: function () {
            var priceWithoutTax = this.get_all_prices().priceWithoutTax;
            return priceWithoutTax ? ((this.get_margin()) / priceWithoutTax) * 100 : 0;
        },

        get_margin_rate_str: function() {
            return this.pos.chrome.format_pr(this.get_margin_rate(), 0.01)  + "%";
        },

    });

    models.Orderline = OrderLineMargin;

});



