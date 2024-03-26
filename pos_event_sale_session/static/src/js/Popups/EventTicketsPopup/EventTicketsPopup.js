/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale_session.EventTicketsPopup", function (require) {
    "use strict";

    const EventTicketsPopup = require("pos_event_sale.EventTicketsPopup");
    const Registries = require("point_of_sale.Registries");

    const PosEventSaleSessionEventTicketsPopup = (EventTicketsPopup) =>
        class extends EventTicketsPopup {
            /**
             * @override
             */
            _getAddProductOptions() {
                const options = super._getAddProductOptions(...arguments);
                if (this.props.session) {
                    options.extras.event_session_id = this.props.session.id;
                }
                return options;
            }
        };

    Registries.Component.extend(
        EventTicketsPopup,
        PosEventSaleSessionEventTicketsPopup
    );
    return EventTicketsPopup;
});
