/*
    Copyright 2021 Camptocamp (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.Orderline", function (require) {
    "use strict";

    const utils = require("web.utils");
    const core = require("web.core");
    const Registries = require("point_of_sale.Registries");
    const {Orderline} = require("point_of_sale.models");
    const _t = core._t;
    const round_di = utils.round_decimals;

    const PosEventSaleOrderLine = (Orderline) =>
        class extends Orderline {
            /**
             * @returns the event.ticket object
             */
            getEventTicket() {
                if (this.event_ticket_id) {
                    return this.pos.db.getEventTicketByID(this.event_ticket_id);
                }
            }

            /**
             * @returns the event object related to this line event.ticket
             */
            getEvent() {
                if (this.event_ticket_id) {
                    return this.getEventTicket().getEvent();
                }
            }

            /**
             * @returns {String} The full event description for this order line
             */
            getEventSaleDescription() {
                const event = this.getEvent();
                const ticket = this.getEventTicket();
                if (ticket && event) {
                    return `${event.display_name} (${ticket.name})`;
                }
                return "";
            }

            /**
             * Please note it doesn't check the available seats against the backend.
             * For a real availability check see updateAndCheckEventAvailability.
             *
             * @returns {Boolean}
             */
            _checkEventAvailability() {
                const ticket = this.getEventTicket();
                if (!ticket) {
                    return;
                }
                // If it's negative, we've oversold
                return ticket.getSeatsAvailableReal({order: this.order}) >= 0;
            }

            /**
             * Please note it doesn't check the available seats against the backend.
             * For a real availability check see updateAndCheckEventAvailability.
             *
             * @throws {Error}
             */
            checkEventAvailability() {
                if (!this._checkEventAvailability()) {
                    throw new Error(
                        _.str.sprintf(
                            _t("Not enough available seats for %s"),
                            this.getEventSaleDescription()
                        )
                    );
                }
            }

            /**
             * @override
             */
            get_lst_price() {
                if (this.event_ticket_id) {
                    return this.getEventTicket().price;
                }
                return super.get_lst_price.apply(this, arguments);
            }

            /**
             * @override
             */
            set_lst_price(price) {
                if (this.event_ticket_id) {
                    this.order.assert_editable();
                    this.getEventTicket().price = round_di(
                        parseFloat(price) || 0,
                        this.pos.dp["Product Price"]
                    );
                    this.trigger("change", this);
                }
                return super.set_lst_price.apply(this, arguments);
            }

            /**
             * @override
             */
            can_be_merged_with(orderline) {
                if (this.event_ticket_id !== orderline.event_ticket_id) {
                    return false;
                }
                return super.can_be_merged_with.apply(this, arguments);
            }

            /**
             * @override
             */
            get_full_product_name() {
                if (this.full_product_name) {
                    return this.full_product_name;
                }
                if (this.event_ticket_id) {
                    return this.getEventSaleDescription();
                }
                return super.get_full_product_name.apply(this, arguments);
            }

            /**
             * @override
             */
            clone() {
                const res = super.clone.apply(this, arguments);
                res.event_ticket_id = this.event_ticket_id;
                return res;
            }

            /**
             * @override
             */
            init_from_JSON(json) {
                super.init_from_JSON.apply(this, arguments);
                this.event_ticket_id = json.event_ticket_id;
            }

            /**
             * @override
             */
            export_as_JSON() {
                const res = super.export_as_JSON.apply(this, arguments);
                res.event_ticket_id = this.event_ticket_id;
                return res;
            }

            /**
             * @override
             */
            export_for_printing() {
                const res = super.export_for_printing.apply(this, arguments);
                if (this.event_ticket_id) {
                    res.event = this.getEvent();
                    res.event_ticket = this.getEventTicket();
                }
                return res;
            }
        };

    Registries.Model.extend(Orderline, PosEventSaleOrderLine);

    return Orderline;
});
