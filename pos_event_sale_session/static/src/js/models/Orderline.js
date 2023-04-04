/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale_session.Orderline", function (require) {
    "use strict";

    const models = require("pos_event_sale.Orderline");

    const OrderlineSuper = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        /**
         * @returns the event.session object
         */
        getEventSession: function () {
            if (this.event_session_id) {
                return this.pos.db.getEventSessionByID(this.event_session_id);
            }
        },
        /**
         * @override
         */
        getEventSaleDescription: function () {
            const session = this.getEventSession();
            const ticket = this.getEventTicket();
            if (session & ticket) {
                return `${session.display_name} (${ticket.name})`;
            }
            return OrderlineSuper.getEventSaleDescription.apply(this, arguments);
        },
        /**
         * @override to handle event session availability
         */
        _checkEventAvailability: function () {
            const session = this.getEventSession();
            if (session) {
                const ticket = this.getEventTicket();
                return ticket.getSeatsAvailableReal({order: this.order, session}) >= 0;
            }
            return OrderlineSuper._checkEventAvailability.apply(this, arguments);
        },
        /**
         * @override
         */
        can_be_merged_with: function (orderline) {
            if (this.event_session_id !== orderline.event_session_id) {
                return false;
            }
            return OrderlineSuper.can_be_merged_with.apply(this, arguments);
        },
        /**
         * @override
         */
        clone: function () {
            const res = OrderlineSuper.clone.apply(this, arguments);
            res.event_session_id = this.event_session_id;
            return res;
        },
        /**
         * @override
         */
        init_from_JSON: function (json) {
            OrderlineSuper.init_from_JSON.apply(this, arguments);
            this.event_session_id = json.event_session_id;
        },
        /**
         * @override
         */
        export_as_JSON: function () {
            const res = OrderlineSuper.export_as_JSON.apply(this, arguments);
            res.event_session_id = this.event_session_id;
            return res;
        },
        /**
         * @override
         */
        export_for_printing: function () {
            const res = OrderlineSuper.export_for_printing.apply(this, arguments);
            if (this.event_session_id) {
                res.event_session = this.getEventSession();
            }
            return res;
        },
    });

    return models;
});
