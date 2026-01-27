/** ***************************************************************************
    Copyright (C) 2022 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
******************************************************************************/

odoo.define("pos_cashback.Order", function (require) {
    var {Order} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");
    var utils = require("web.utils");

    var round_pr = utils.round_precision;

    const OverloadOrder = (OriginalOrder) =>
        class extends OriginalOrder {
            get_extradue_cashback() {
                var total_cash_received = 0.0;
                var extradue = 0.0;
                var due = this.get_due();
                var lines = this.get_paymentlines();

                if (due && lines.length) {
                    extradue = due;
                }

                _.each(lines, function (line) {
                    if (line.payment_method.type === "cash") {
                        total_cash_received += line.amount;
                    }
                });

                if (extradue < 0.0 && total_cash_received + extradue < 0.0) {
                    return round_pr(
                        -(total_cash_received + extradue),
                        this.pos.currency.rounding
                    );
                }
                return round_pr(0.0, this.pos.currency.rounding);
            }
        };
    Registries.Model.extend(Order, OverloadOrder);
});
