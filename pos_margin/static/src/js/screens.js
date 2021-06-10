// Copyright (C) 2021 - Today: GRAP (http://www.grap.coop)
// @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

odoo.define("pos_margin.screens", function (require) {
    "use strict";

    var screens = require("point_of_sale.screens");

    screens.OrderWidget.include({
        update_summary: function () {
            this._super.apply(this, arguments);
            var order = this.pos.get_order();
            if (!order.get_orderlines().length) {
                return;
            }
            this.el.querySelector(".summary .order-margin .value-margin-rate").textContent = this.format_pr(order.get_margin_rate(), 0.01) + "%";
            this.el.querySelector(".summary .order-margin .value-margin").textContent = this.format_currency(order.get_margin());
        },
    });

});
