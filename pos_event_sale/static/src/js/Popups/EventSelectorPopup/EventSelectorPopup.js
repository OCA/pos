/*
    Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.EventSelectorPopup", function (require) {
    "use strict";

    const {useState} = owl;
    const {useListener} = require("@web/core/utils/hooks");
    const {getDatesInRange} = require("pos_event_sale.utils");
    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const Registries = require("point_of_sale.Registries");
    const {onWillStart} = owl;

    class EventSelectorPopup extends AbstractAwaitablePopup {
        /**
         * @param {Object} props
         * @param {Object} props.product Filter available events by product.
         *
         * Resolve to { confirmed, payload } when used with showPopup method.
         * @confirmed {Boolean}
         * @payload {Object} Selected event.
         */
        setup() {
            super.setup();
            this.state = useState({
                selectedStartDate: moment().startOf("day").toDate(),
                selectedEndDate: moment().endOf("day").toDate(),
                filters: [],
            });
            useListener("select-dates", this.selectDates);
            useListener("click-event", this.clickEvent);
            // If there's a product, get all events related to this product
            // If not, show all available events (use case: Add Event button)
            if (this.props.product) {
                this.state.filters.push({
                    kind: "product",
                    data: this.props.product.id,
                    label: this.env._t("Product"),
                    value: this.props.product.display_name,
                });
            }
            // Cached properties
            this._events = null;
            this._eventsByDate = null;
            onWillStart(this.willStart);
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
                    event_ids: this.env.pos.db.events.map((event) => event.id),
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
         * Compiles a filter specification into a filter function suitable to filter events.
         *
         * @param {Object} filter Filter specification
         * @param {String} filter.kind Type of filter (e.g.: "product", "name", "tag")
         * @param {String} filter.label Human-readable label
         * @param {String} filter.value Human-readable value
         * @param {any} filter.data
         * @returns {Function} Filter function to apply to events.
         */
        _compileFilter(filter) {
            if (filter.kind === "product") {
                const productEvents = this.env.pos.db.getEventsByProductID(filter.data);
                return (event) => productEvents.includes(event);
            }
            if (filter.kind === "search") {
                const {fieldName, searchTerm} = filter.data;
                const searchTerms = searchTerm.split(" ");
                const searchString = (source, terms) => {
                    const sourceLower = source.toLowerCase();
                    return terms.every((term) =>
                        sourceLower.includes(term.toLowerCase())
                    );
                };
                /* eslint-disable no-shadow */
                const fieldGetterChar = (event, fieldName) => event[fieldName] || "";
                const fieldGetterMany2one = (event, fieldName) =>
                    event[fieldName] ? event[fieldName][1] : "";
                const fieldGetter = fieldName.endsWith("_id")
                    ? fieldGetterMany2one
                    : fieldGetterChar;
                return (event) =>
                    searchString(fieldGetter(event, fieldName), searchTerms);
            }
            if (filter.kind === "tag") {
                const {tagID} = filter.data;
                return (event) => event.tag_ids && event.tag_ids.includes(tagID);
            }
        }
        /**
         * Compile filters
         *
         * @returns {Function} Filter function to apply to events.
         */
        _compileFilters() {
            const filterFunctions = this.state.filters.map((filter) =>
                this._compileFilter(filter)
            );
            const filterFunction = (event) =>
                filterFunctions.every((filter) => filter(event));
            return filterFunction;
        }
        /**
         * @property {Array} events List of filtered events
         */
        get events() {
            this._events = this.env.pos.db.events.filter(this._compileFilters());
            return this._events;
        }
        /**
         * @property {Object} eventsByDate Mapping of dates and filtered events
         */
        get eventsByDate() {
            this._eventsByDate = {};
            for (const event of this.events) {
                for (const eventDate of event.getEventDates()) {
                    const key = moment(eventDate).format("YYYY-MM-DD");
                    this._eventsByDate[key] = this._eventsByDate[key] || [];
                    this._eventsByDate[key].push(event);
                }
            }
            return this._eventsByDate;
        }
        /**
         * @property {Array} eventsToDisplay List of events displayed in EventList
         */
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
        /**
         * @event
         * @param {Event} event
         */
        selectDates(event) {
            const {start, end} = event.detail;
            this.state.selectedStartDate = start;
            this.state.selectedEndDate = moment(end).subtract(1, "seconds").toDate();
        }
        /**
         * @event
         * @param {Event} ev
         */
        async clickEvent(ev) {
            const {event} = ev.detail;
            await this.showPopup("EventTicketsPopup", {event});
        }
        /**
         * @event
         * @param {Event} event
         */
        onFiltersChange(event) {
            this._events = null;
            this._eventsByDate = null;
            this.state.filters = event.detail;
            this.render();
        }
    }
    EventSelectorPopup.template = "EventSelectorPopup";

    Registries.Component.add(EventSelectorPopup);
    return EventSelectorPopup;
});
