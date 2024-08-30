/*
    Copyright 2019 ACSONE SA/NV
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

*/

odoo.define("pos_payment_restriction.screens", function(require) {
    "use strict";

    var screens = require("point_of_sale.screens");

    screens.PaymentScreenWidget.include({
        payment_input: function() {
            if (this.pos.config.payment_amount_readonly) {
                return;
            }
            this._super.apply(this, arguments);
        },
    });
});
