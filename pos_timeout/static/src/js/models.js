odoo.define("pos_timeout.models", function (require) {
    "use strict";

    const PosModels = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    const PosGlobalState = (OriginalPosGlobalState) =>
        class extends OriginalPosGlobalState {
            _save_to_server(orders, options) {
                const configTimeout = this.env.pos.config.pos_order_timeout;
                if (configTimeout) {
                    options.timeout = configTimeout * 1000 * orders.length;
                }

                return super._save_to_server(orders, options);
            }
        };

    Registries.Model.extend(PosModels.PosGlobalState, PosGlobalState);

    return PosGlobalState;
});
