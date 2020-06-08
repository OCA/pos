// Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
// @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

odoo.define("pos_meal_voucher.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");
    var utils = require("web.utils");

    var round_pr = utils.round_precision;

    models.load_fields("product.product", ["meal_voucher_ok"]);

    models.load_fields("account.journal", ["meal_voucher_type", "meal_voucher_mixed_text"]);

    var OrderSuper = models.Order.prototype;
    var Order = models.Order.extend({

        get_total_meal_voucher_eligible: function() {
            return round_pr(this.orderlines.reduce((function(sum, orderLine) {
                if (orderLine.product.meal_voucher_ok){
                    return sum + orderLine.get_price_with_tax();
                } else {
                    return sum;
                }
            }), 0), this.pos.currency.rounding);
        },
        get_total_meal_voucher_received: function(){
            return round_pr(this.paymentlines.reduce((function(sum, paymentLine) {
                if (paymentLine.is_meal_voucher()) {
                    return sum + paymentLine.get_amount();
                } else {
                    return sum;
                }
            }), 0), this.pos.currency.rounding);
        },
    });

    models.Order = Order;

    var PaymentlineSuper = models.Paymentline.prototype;

    var Paymentline = models.Paymentline.extend({

        initialize: function(){
            PaymentlineSuper.initialize.apply(this, arguments);
            // We use 'payment_note', because 'note' field is still used
            // to set in the payment_name value.
            // See odoo/addons/point_of_sale/models/pos_order.py:59
            // and then in the name of the statement line.
            // See odoo/addons/point_of_sale/models/pos_order.py:950
            this.statement_note = '';
            this.manual_meal_voucher = false;
        },

        init_from_JSON: function (json) {
            PaymentlineSuper.init_from_JSON.apply(this, arguments);
            this.statement_note = json.statement_note;
        },
        export_as_JSON: function () {
            var res = PaymentlineSuper.export_as_JSON.apply(this, arguments);
            res.statement_note = this.statement_note;
            return res;
        },

        is_meal_voucher: function() {
            return (
                this.manual_meal_voucher === true ||
                ["paper", "dematerialized"].indexOf(
                    this.cashregister.journal.meal_voucher_type) !== -1
                )
        },

    });

    models.Paymentline = Paymentline;

});
