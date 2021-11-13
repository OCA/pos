/*
    Copyright 2021 Camptocamp (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.EventRegistrationReceipt", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class EventRegistrationReceipt extends PosComponent {
        constructor() {
            super(...arguments);
            this._receiptEnv = this.props.order.getOrderReceiptEnv();
        }
        willUpdateProps(nextProps) {
            this._receiptEnv = nextProps.order.getOrderReceiptEnv();
        }
        get receiptEnv() {
            return this._receiptEnv;
        }
        get receipt() {
            return this.receiptEnv.receipt;
        }
        get registration() {
            return this.props.registration;
        }
        get event() {
            const [event_id] = this.registration.event_id || [false];
            return event_id ? this.env.pos.db.getEventByID(event_id) : undefined;
        }
        get eventTicket() {
            const [event_ticket_id] = this.registration.event_ticket_id || [false];
            return event_ticket_id
                ? this.env.pos.db.getEventTicketByID(event_ticket_id)
                : undefined;
        }
        formatDate(date) {
            return moment(date).format("lll");
        }
    }
    EventRegistrationReceipt.template = "EventRegistrationReceipt";

    Registries.Component.add(EventRegistrationReceipt);
    return EventRegistrationReceipt;
});
