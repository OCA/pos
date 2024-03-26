/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale_session.EventRegistrationReceipt", function (require) {
    "use strict";

    const EventRegistrationReceipt = require("pos_event_sale.EventRegistrationReceipt");
    const Registries = require("point_of_sale.Registries");

    const PosEventSaleSessionEventRegistrationReceipt = (EventRegistrationReceipt) =>
        class extends EventRegistrationReceipt {
            get session() {
                const [session_id] = this.registration.session_id || [false];
                return session_id
                    ? this.env.pos.db.getEventSessionByID(session_id)
                    : undefined;
            }
        };

    Registries.Component.extend(
        EventRegistrationReceipt,
        PosEventSaleSessionEventRegistrationReceipt
    );
    return EventRegistrationReceipt;
});
