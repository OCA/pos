/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_sale_pos_event_sale.models", function (require) {
    "use strict";

    // Make sure dependencies are loaded
    require("pos_sale.models");
    require("pos_event_sale.Orderline");

    const models = require("point_of_sale.models");

    const OrderlineSuper = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        /**
         * @override
         */
        setQuantityFromSOL: function (saleOrderLine) {
            if (this.product.detailed_type === "event") {
                this.set_quantity(
                    Math.max(
                        0,
                        saleOrderLine.product_uom_qty - saleOrderLine.qty_invoiced
                    )
                );
                this.event_ticket_id =
                    saleOrderLine.event_ticket_id && saleOrderLine.event_ticket_id[0];
                // Force a recomputation through getEventSaleDescription
                this.full_product_name = undefined;
            } else {
                return OrderlineSuper.setQuantityFromSOL.apply(this, arguments);
            }
        },
    });

    return models;
});
