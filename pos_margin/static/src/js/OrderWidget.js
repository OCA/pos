// Copyright (C) 2021 - Today: GRAP (http://www.grap.coop)
// @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

odoo.define("pos_margin.OrderWidget", function (require) {
    "use strict";

    var OrderWidget = require("point_of_sale.OrderWidget");
    const Registries = require("point_of_sale.Registries");
    var field_utils = require("web.field_utils");

    const PosOrderWidget = (OrderWidget) =>
        class extends OrderWidget {
            _updateSummary() {
                super._updateSummary(...arguments);
                var order = this.env.pos.get_order();
                if (!order.get_orderlines().length) {
                    return;
                }
                var value_margin = document.getElementsByClassName("value-margin");
                if (value_margin && value_margin.length) {
                    value_margin[0].textContent = this.env.pos.format_currency(
                        order.get_margin()
                    );
                }
                var value_margin_rate = document.getElementsByClassName(
                    "value-margin-rate"
                );
                if (value_margin_rate && value_margin_rate.length) {
                    value_margin_rate[0].textContent =
                        field_utils.format.float(order.get_margin_rate()) + "%";
                }
            }
        };
    Registries.Component.extend(OrderWidget, PosOrderWidget);
    return OrderWidget;
});
