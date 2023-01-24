/** @odoo-module **/
// Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
// @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import PosComponent from "point_of_sale.PosComponent";
import Registries from "point_of_sale.Registries";

export class OrderSummaryMargin extends PosComponent {
    getOrderMargin() {
        const self = this;
        const order = self.env.pos.get_order();
        if (!order.get_orderlines().length) {
            return false;
        }
        const margin = self.env.pos.format_currency(order.get_margin());
        const margin_rate = order.get_margin_rate_str();

        return {margin, margin_rate};
    }
}

OrderSummaryMargin.template = "OrderSummaryMargin";

Registries.Component.add(OrderSummaryMargin);
