/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/
odoo.define("pos_lot_selection.CustomOrderWidget", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const OrderWidget = require("point_of_sale.OrderWidget");

    const CustomOrderWidget = (OrderWidget) =>
        class extends OrderWidget {
            /**
             * @override
             */
            async _editPackLotLines(event) {
                const orderline = event.detail.orderline;
                this.env.session.lots = await this.env.pos.getProductLots(
                    orderline.product
                );
                const res = await super._editPackLotLines(...arguments);
                this.env.session.lots = undefined;
                return res;
            }
        };

    Registries.Component.extend(OrderWidget, CustomOrderWidget);
    return OrderWidget;
});
