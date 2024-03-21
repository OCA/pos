/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale_session.Orderline", function (require) {
    "use strict";

    const models = require("pos_event_sale.Orderline");
    const {Orderline} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");


    const PosEventSaleOrderLine = (Orderline) =>
        class extends Orderline {
        /**
         * @returns the event.session object
         */
        getEventSession() {
            if (this.event_session_id) {
                return this.pos.db.getEventSessionByID(this.event_session_id);
            }
        }
        /**
         * @override
         */
        getEventSaleDescription() {
            const session = this.getEventSession();
            const ticket = this.getEventTicket();
            if (session & ticket) {
                return `${session.display_name} (${ticket.name})`;
            }
            return super.getEventSaleDescription.apply(this, arguments);
        }
        /**
         * @override to handle event session availability
         */
        _checkEventAvailability() {
            const session = this.getEventSession();
            if (session) {
                const ticket = this.getEventTicket();
                return ticket.getSeatsAvailableReal({order: this.order, session}) >= 0;
            }
            return super._checkEventAvailability.apply(this, arguments);
        }
        /**
         * @override
         */
        can_be_merged_with(orderline) {
            if (this.event_session_id !== orderline.event_session_id) {
                return false;
            }
            return super.can_be_merged_with.apply(this, arguments);
        }
        /**
         * @override
         */
        clone() {
            const res = super.clone.apply(this, arguments);
            res.event_session_id = this.event_session_id;
            return res;
        }
        /**
         * @override
         */
        init_from_JSON(json) {
            super.init_from_JSON.apply(this, arguments);
            this.event_session_id = json.event_session_id;
        }
        /**
         * @override
         */
        export_as_JSON() {
            const res = super.export_as_JSON.apply(this, arguments);
            res.event_session_id = this.event_session_id;
            return res;
        }
        /**
         * @override
         */
        export_for_printing() {
            const res = super.export_for_printing.apply(this, arguments);
            if (this.event_session_id) {
                res.event_session = this.getEventSession();
            }
            return res;
        }
    }
    Registries.Model.extend(Orderline, PosEventSaleOrderLine);
    return Orderline;
});
