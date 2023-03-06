/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define(
    "pos_sale_pos_event_sale_session.SaleOrderManagementScreen",
    function (require) {
        "use strict";

        const SaleOrderManagementScreen = require("pos_sale_pos_event_sale.SaleOrderManagementScreen");
        const Registries = require("point_of_sale.Registries");

        const ExtSaleOrderManagementScreen = (SaleOrderManagementScreen) =>
            class extends SaleOrderManagementScreen {
                /**
                 * @override to load missing sessions
                 */
                async _getSaleOrder(id) {
                    const order = await super._getSaleOrder(id);
                    await this._loadMissingEventSessions(order);
                    return order;
                }
                /**
                 * Load missing event.session records from sale order data
                 */
                async _loadMissingEventSessions(order) {
                    const missingEventSessionIds = [];
                    for (const line of order.order_line) {
                        const eventSessionId =
                            line.event_session_id && line.event_session_id[0];
                        if (
                            eventSessionId &&
                            !missingEventSessionIds.includes(eventSessionId)
                        ) {
                            if (
                                !this.env.pos.db.getEventSessionByID(
                                    eventSessionId,
                                    false
                                )
                            ) {
                                missingEventSessionIds.push(eventSessionId);
                            }
                        }
                    }
                    if (!missingEventSessionIds.length) {
                        return;
                    }
                    const eventSessionModel = this.env.pos.models.find(
                        (model) => model.model === "event.session"
                    );
                    const eventSessions = await this.rpc({
                        model: eventSessionModel.model,
                        method: "read",
                        args: [missingEventSessionIds, eventSessionModel.fields],
                        context: this.env.session.user_context,
                    });
                    eventSessionModel.loaded(this.env.pos, eventSessions);
                }
            };

        Registries.Component.extend(
            SaleOrderManagementScreen,
            ExtSaleOrderManagementScreen
        );

        return SaleOrderManagementScreen;
    }
);
