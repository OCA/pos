/** ***************************************************************************
    Copyright (C) 2022 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
******************************************************************************/

odoo.define('pos_cashback_warning.screens', function (require) {
    "use strict";

    var screens = require("point_of_sale.screens");
    var core = require("web.core");
    var _t = core._t;

    screens.PaymentScreenWidget.include({

        render_paymentlines: function() {
            var total_cash_received = 0.0
            var extradue = 0.0;

            var order = this.pos.get_order();
            if (order && order.get_total_with_tax() > 0.0) {
                // Note Copy from original function render_paymentlines
                // to recompute extradue value
                var lines = order.get_paymentlines();
                var due   = order.get_due();
                if (due && lines.length  && due !== order.get_due(lines[lines.length-1])) {
                    extradue = due;
                }
                _.each(lines, function (line) {
                    if (line.cashregister.journal.type === "cash") {
                        total_cash_received += line.amount;
                    }
                });
            }
            if (extradue < 0.0 && (total_cash_received + extradue) < 0.0) {
                this.extradue_cashback =  - (total_cash_received + extradue);
            }
            else {
                this.extradue_cashback = 0.0;
            }
            this._super();
        },

    });

    return screens;
});
