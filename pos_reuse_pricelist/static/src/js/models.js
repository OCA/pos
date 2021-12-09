/*
 *  Copyright 2021 Akretion
 *  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)
 */

odoo.define("pos_reuse_pricelist.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");
    const posmodel_super = models.PosModel.prototype;

    models.PosModel = models.PosModel.extend({
        on_removed_order(removed_order, index, reason) {
            posmodel_super.on_removed_order.apply(this, arguments);
            const order_list = this.get_order_list();
            const newOrderCreated = !(
                (reason === "abandon" || removed_order.temporary) &&
                order_list.length > 0
            );
            if (newOrderCreated) {
                this.get_order().pricelist = removed_order.pricelist;
            }
        },
    });

    return models;
});
