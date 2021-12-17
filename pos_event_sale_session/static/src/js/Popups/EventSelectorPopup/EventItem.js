/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale_session.EventItem", function (require) {
    "use strict";

    const EventItem = require("pos_event_sale.EventItem");
    const Registries = require("point_of_sale.Registries");

    const PosEventSaleSessionEventItem = (EventItem) =>
        class extends EventItem {
            /**
             * @override
             */
            constructor() {
                super(...arguments);
                // Get availability from the session instead
                if (this.props.session) {
                    this.state.seatsAvailable =
                        this.props.session.getSeatsAvailableReal();
                }
            }
        };

    Registries.Component.extend(EventItem, PosEventSaleSessionEventItem);
    return EventItem;
});
