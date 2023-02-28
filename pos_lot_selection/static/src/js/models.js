/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/
odoo.define("pos_lot_selection.models", function (require) {
    "use strict";

    const {PosGlobalState} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    const LotSelectPosGlobalState = (PosGlobalState) =>
        class extends PosGlobalState {
            async getProductLots(product) {
                try {
                    return await this.env.services.rpc(
                        {
                            model: "stock.lot",
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
            }
        };

    Registries.Model.extend(PosGlobalState, LotSelectPosGlobalState);
    return PosGlobalState;
});
