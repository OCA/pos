/*
    Copyright 2021 Camptocamp (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.Orderline", function (require) {
    "use strict";

    const models = require("point_of_sale.models");
    const utils = require("web.utils");
    const core = require("web.core");
    const _t = core._t;
    const round_di = utils.round_decimals;

    const OrderlineSuper = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        /**
         * @returns the event.ticket object
         */
        getEventTicket: function () {
            if (this.event_ticket_id) {
                return this.pos.db.getEventTicketByID(this.event_ticket_id);
            }
        },
        /**
         * @returns the event object related to this line event.ticket
         */
        getEvent: function () {
            if (this.event_ticket_id) {
                return this.getEventTicket().getEvent();
            }
        },
        /**
         * @returns {String} The full event description for this order line
         */
        getEventSaleDescription: function () {
            const event = this.getEvent();
            const ticket = this.getEventTicket();
            if (ticket && event) {
                return `${event.display_name} (${ticket.name})`;
            }
            return "";
        },
        /**
         * Please note it doesn't check the available seats against the backend.
         * For a real availability check see updateAndCheckEventAvailability.
         *
         * @returns {Boolean}
         */
        _checkEventAvailability: function () {
            const ticket = this.getEventTicket();
            if (!ticket) {
                return;
            }
            // If it's negative, we've oversold
            return ticket.getSeatsAvailableReal({order: this.order}) >= 0;
        },
        /**
         * Please note it doesn't check the available seats against the backend.
         * For a real availability check see updateAndCheckEventAvailability.
         *
         * @throws {Error}
         */
        checkEventAvailability: function () {
            if (!this._checkEventAvailability()) {
                throw new Error(
                    _.str.sprintf(
                        _t("Not enough available seats for %s"),
                        this.getEventSaleDescription()
                    )
                );
            }
        },
        /**
         * @override
         */
        get_lst_price: function () {
            if (this.event_ticket_id) {
                return this.getEventTicket().price;
            }
            return OrderlineSuper.get_lst_price.apply(this, arguments);
        },
        /**
         * @override
         */
        set_lst_price: function (price) {
            if (this.event_ticket_id) {
                this.order.assert_editable();
                this.getEventTicket().price = round_di(
                    parseFloat(price) || 0,
                    this.pos.dp["Product Price"]
                );
                this.trigger("change", this);
            }
            return OrderlineSuper.set_lst_price.apply(this, arguments);
        },
        /**
         * @override
         */
        can_be_merged_with: function (orderline) {
            if (this.event_ticket_id !== orderline.event_ticket_id) {
                return false;
            }
            return OrderlineSuper.can_be_merged_with.apply(this, arguments);
        },
        /**
         * @override
         */
        get_full_product_name: function () {
            if (this.full_product_name) {
                return this.full_product_name;
            }
            if (this.event_ticket_id) {
                return this.getEventSaleDescription();
            }
            return OrderlineSuper.get_full_product_name.apply(this, arguments);
        },
        /**
         * @override
         */
        clone: function () {
            const res = OrderlineSuper.clone.apply(this, arguments);
            res.event_ticket_id = this.event_ticket_id;
            return res;
        },
        /**
         * @override
         */
        init_from_JSON: function (json) {
            OrderlineSuper.init_from_JSON.apply(this, arguments);
            this.event_ticket_id = json.event_ticket_id;
        },
        /**
         * @override
         */
        export_as_JSON: function () {
            const res = OrderlineSuper.export_as_JSON.apply(this, arguments);
            res.event_ticket_id = this.event_ticket_id;
            return res;
        },
        /**
         * @override
         */
        export_for_printing: function () {
            const res = OrderlineSuper.export_for_printing.apply(this, arguments);
            if (this.event_ticket_id) {
                res.event = this.getEvent();
                res.event_ticket = this.getEventTicket();
            }
            return res;
        },
    });

    return models;
});
