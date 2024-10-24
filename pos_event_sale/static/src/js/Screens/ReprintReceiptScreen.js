/*
    Copyright 2023 Camptocamp (https://www.camptocamp.com).
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.ReprintReceiptScreen", function (require) {
    "use strict";

    const ReprintReceiptScreen = require("point_of_sale.ReprintReceiptScreen");
    const Registries = require("point_of_sale.Registries");
    const session = require("web.session");
    const {onWillStart} = owl;

    /* eslint-disable no-shadow */
    const PosEventSaleReprintReceiptScreen = (ReprintReceiptScreen) =>
        class extends ReprintReceiptScreen {
            setup() {
                super.setup();
                onWillStart(this.willStart);
            }

            /**
             * @override
             */
            async willStart() {
                await super.willStart();
                const order = this.props.order;
                if (order.backendId && order.hasEvents()) {
                    order.event_registrations = await this.rpc({
                        model: "event.registration",
                        method: "search_read",
                        domain: [
                            ["pos_order_id", "=", order.backendId],
                            ["state", "=", "open"],
                        ],
                        kwargs: {context: session.user_context},
                    });
                }
            }
            /**
             * @override
             */
            async _printReceipt() {
                const res = await super._printReceipt();
                await this._printEventRegistrations();
                return res;
            }
        };

    Registries.Component.extend(ReprintReceiptScreen, PosEventSaleReprintReceiptScreen);
    return ReprintReceiptScreen;
});
