// Copyright (C) 2021 - Initos Gmbh
// @author: Dhara Solanki (dhara.solanki@initos.com)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

odoo.define("point_of_sale.OrderSummaryMargin", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class OrderSummaryMargin extends PosComponent {}
    OrderSummaryMargin.template = "OrderSummaryMargin";

    Registries.Component.add(OrderSummaryMargin);

    return OrderSummaryMargin;
});
