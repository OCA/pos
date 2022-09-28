/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/
odoo.define("pos_lot_selection.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");

    models.PosModel = models.PosModel.extend({
        async getProductLots(product) {
            try {
                return await this.rpc(
                    {
                        model: "stock.production.lot",
                        method: "get_available_lots_for_pos",
                        kwargs: {
                            product_id: product.id,
                            company_id: this.env.session.company_id,
                        },
                    },
                    {shadow: true}
                );
            } catch (error) {
                console.error(error);
                return [];
            }
        },
    });

    return models;
});
