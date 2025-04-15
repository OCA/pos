/** @odoo-module **/
// Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
// @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import {Component} from "@odoo/owl";
import {OrderWidget} from "@point_of_sale/app/generic_components/order_widget/order_widget";
import {usePos} from "@point_of_sale/app/store/pos_hook";

export class OrderSummaryMargin extends Component {
    static template = "OrderSummaryMargin";
    setup() {
        this.pos = usePos();
    }

    getOrderMargin() {
        const order = this.pos.get_order();
        if (!order.get_orderlines().length) {
            return false;
        }
        const margin = this.env.utils.formatCurrency(order.get_margin());
        const margin_rate = order.get_margin_rate_str();

        return {margin, margin_rate};
    }
}

OrderWidget.components = {
    ...OrderWidget.components,
    OrderSummaryMargin,
};
