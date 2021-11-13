/*
    Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.EventSelectorPopup", function (require) {
    "use strict";

    const {useState} = owl.hooks;
    const {useListener} = require("web.custom_hooks");
    const {getDatesInRange} = require("pos_event_sale.utils");
    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const Registries = require("point_of_sale.Registries");

    class EventSelectorPopup extends AbstractAwaitablePopup {
        /**
         * @param {Object} props
         * @param {Object} props.product Filter available events by product.
         *
         * Resolve to { confirmed, payload } when used with showPopup method.
         * @confirmed {Boolean}
         * @payload {Object} Selected event.
         */
        constructor() {
            super(...arguments);
            this.state = useState({
                selectedStartDate: moment().startOf("day").toDate(),
                selectedEndDate: moment().endOf("day").toDate(),
            });
            useListener("select-dates", this.selectDates);
            useListener("click-event", this.clickEvent);
            // If there's a product, get all events related to this product
            // If not, show all available events (use case: Add Event button)
            if (this.props.product) {
                this.events = this.env.pos.db.getEventsByProductID(
                    this.props.product.id
                );
            } else {
                this.events = this.env.pos.db.events;
            }
            // Build a map of events by date where keys are Strings YYYY-MM-DD
            this.eventsByDate = this.getEventsByDate(this.events);
        }
        /**
         * @override
         *
         * Optional update of available seats. Fails silently if no internet connection.
         * A final availability check is done before paying the order anyways.
         */
        async willStart() {
            try {
                await this.env.pos.db.updateEventSeatsAvailable({
                    event_ids: this.events.map((event) => event.id),
                    options: {
                        timeout: 1000,
                        shadow: true,
                    },
                });
            } catch (error) {
                console.debug(error);
            }
        }
        /**
         * @param {Array} events List of events
         * @returns Object mapping events by date string YYYY-MM-DD
         */
        getEventsByDate(events) {
            const res = {};
            for (const event of events) {
                for (const eventDate of event.getEventDates()) {
                    const key = moment(eventDate).format("YYYY-MM-DD");
                    res[key] = res[key] || [];
                    res[key].push(event);
                }
            }
            return res;
        }
        get eventsToDisplay() {
            const dates = getDatesInRange(
                this.state.selectedStartDate,
                this.state.selectedEndDate
            );
            const keys = dates.map((date) => moment(date).format("YYYY-MM-DD"));
            const events = [];
            for (const key of keys) {
                if (this.eventsByDate[key] && this.eventsByDate[key].length) {
                    events.push(...this.eventsByDate[key]);
                }
            }
            return _.unique(events);
        }
        selectDates(event) {
            const {start, end} = event.detail;
            this.state.selectedStartDate = start;
            this.state.selectedEndDate = moment(end).subtract(1, "seconds").toDate();
        }
        async clickEvent(ev) {
            const {event} = ev.detail;
            await this.showPopup("EventTicketsPopup", {event});
        }
    }
    EventSelectorPopup.template = "EventSelectorPopup";

    Registries.Component.add(EventSelectorPopup);
    return EventSelectorPopup;
});
