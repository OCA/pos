/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale_session.Order", function (require) {
    "use strict";

    const models = require("pos_event_sale.Order");
    const { _t } = require("web.core");
    const Registries = require("point_of_sale.Registries");
    const { Order } = require("point_of_sale.models");


    const PosEventSaleOrder = (Order) =>
        class extends Order {

            /**
             * @returns {Array} EventSessions included in this order
             */
            getEventSessions() {
                return _.unique(
                    this.get_orderlines()
                        .map((line) => line.getEventSession())
                        .filter(Boolean)
                );
            }
            /**
             * @override to also update seats available on sessions, if needed
             */
            async updateAndCheckEventAvailability() {
                const sessions = this.getEventSessions();
                const toUpdate = sessions.filter((session) => session.seats_limited);
                if (toUpdate.length) {
                    try {
                        await this.pos.db.updateEventSessionSeatsAvailable(
                            toUpdate.map((session) => session.id)
                        );
                    } catch (error) {
                        throw new Error(
                            _t(
                                "Unable to check session's availability. " +
                                "Check your internet connection and try again please."
                            )
                        );
                    }
                }
                return super.updateAndCheckEventAvailability.apply(this, arguments);
            }
        }
    Registries.Model.extend(Order, PosEventSaleOrder);
    return Order;
});
