/*
    Copyright 2021 Camptocamp (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.PaymentScreen", function (require) {
    "use strict";

    const PaymentScreen = require("point_of_sale.PaymentScreen");
    const Registries = require("point_of_sale.Registries");
    const session = require("web.session");

    const PosEventSalePaymentScreen = (PaymentScreen) =>
        class extends PaymentScreen {
            async _postPushOrderResolve(order, server_ids) {
                debugger;
                if (order.hasEvents()) {
                    order.event_registrations = await this.rpc({
                        model: "event.registration",
                        method: "search_read",
                        domain: [
                            ["pos_order_id", "in", server_ids],
                            ["state", "=", "open"],
                        ],
                        kwargs: {context: session.user_context},
                    });
                }
                return super._postPushOrderResolve(order, server_ids);
            }
        };

    Registries.Component.extend(PaymentScreen, PosEventSalePaymentScreen);

    return PaymentScreen;
});
