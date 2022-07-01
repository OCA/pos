/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_sale_pos_event_sale_session.models", function (require) {
    "use strict";

    const models = require("pos_sale_pos_event_sale.models");

    const OrderlineSuper = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        /**
         * @override
         */
        setQuantityFromSOL: function (saleOrderLine) {
            const res = OrderlineSuper.setQuantityFromSOL.apply(this, arguments);
            if (this.product.detailed_type === "event") {
                this.event_session_id =
                    saleOrderLine.event_session_id && saleOrderLine.event_session_id[0];
            }
            return res;
        },
    });

    return models;
});
