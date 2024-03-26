/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale_session.EventTicketItem", function (require) {
    "use strict";

    const EventTicketItem = require("pos_event_sale.EventTicketItem");
    const Registries = require("point_of_sale.Registries");

    const PosEventSaleSessionEventTicketItem = (EventTicketItem) =>
        class extends EventTicketItem {
            /**
             * @override
             */
            setup() {
                super.setup()
                // Get availability from the session instead
                if (this.props.session) {
                    this.state.orderedQty = this.props.eventTicket.getOrderedQuantity({
                        session: this.props.session,
                    });
                    this.state.seatsAvailable =
                        this.props.eventTicket.getSeatsAvailableReal({
                            session: this.props.session,
                        });
                }
            }
            /**
             * @override
             */
            _updateQuantities() {
                if (!this.props.session) {
                    return super._updateQuantities(...arguments);
                }
                // Override to update availability from the session
                this.state.seatsAvailable =
                    this.props.eventTicket.getSeatsAvailableReal({
                        session: this.props.session,
                    });
                this.state.orderedQty = this.props.eventTicket.getOrderedQuantity({
                    session: this.props.session,
                });
            }
        };

    Registries.Component.extend(EventTicketItem, PosEventSaleSessionEventTicketItem);
    return EventTicketItem;
});
