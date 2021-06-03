/*
Copyright 2021 Camptocamp SA - Iván Todorovich
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_event_sale.EventSelectorPopup", function(require) {
    "use strict";

    const PopupWidget = require("point_of_sale.popups");
    const gui = require("point_of_sale.gui");
    const core = require("web.core");
    const QWeb = core.qweb;
    const _t = core._t;

    const EventSelectorPopup = PopupWidget.extend({
        template: "EventSelectorPopup",
        events: _.extend({}, PopupWidget.prototype.events, {
            "click .event-list .event-list-item": "click_event",
        }),

        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);
            this.events = [];
            this.eventsByDate = {};
        },

        /**
         * @override
         */
        show: function(options) {
            // If there's a product, get all events related to this product
            // If not, show all available events (use case: Add Event button)
            if (options.product) {
                this.events = this.pos.db.get_events_by_product_id(options.product.id);
            } else {
                this.events = this.pos.db.events;
            }
            // Group events by date
            this.eventsByDate = this._getEventsByDate(this.events);
            // Optional update of available seats. Fails silently if no internet connection.
            // A final availability check is done before paying the order anyways.
            const event_ids = this.events.map(event => event.id);
            const _super = this._super;
            this.pos
                .updateEventSeatsAvailable(event_ids, {timeout: 1000, shadow: true})
                .catch(error => console.debug(error))
                .finally(() => {
                    // Show
                    _super.apply(this, arguments);
                    this.$calendar.fullCalendar("select", new Date());
                });
        },

        /**
         * @override
         */
        renderElement: function() {
            this._super.apply(this, arguments);
            this.$(".button.cancel").click(this.click_cancel.bind(this));
            this.$calendar = this.$(".o_calendar_widget");
            this.$calendar.fullCalendar(this._getCalendarOptions());
        },

        /**
         * @override
         */
        close: function() {
            if (this.$calendar) {
                this.$calendar.fullCalendar("destroy");
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @returns fullcalendar options
         */
        _getCalendarOptions: function() {
            const self = this;
            // This seems like a workaround but apparently passing the locale
            // in the options is not enough. We should initialize it beforehand
            const locale = moment.locale();
            $.fullCalendar.locale(locale);
            // Documentation here : http://arshaw.com/fullcalendar/docs/
            return {
                locale: locale,
                header: {
                    left: "",
                    center: "title",
                    right: "prev,next today",
                },
                buttonText: {today: _t("Today")},
                selectable: true,
                unselectAuto: false,
                height: "auto",
                select: this.selectDates.bind(this),
                dayRender: function(date, cell) {
                    const datekey = date.format("YYYY-MM-DD");
                    if (self.eventsByDate[datekey]) {
                        cell.addClass("has-events");
                    } else {
                        cell.removeClass("has-events");
                    }
                },
            };
        },

        selectDates: function(start, end) {
            const localStartDate = start.local();
            const localEndDate = end.local().subtract(1, "seconds");
            const dates = this._getDatesInRange(localStartDate, localEndDate);
            let events = [];
            for (const date of dates) {
                if (this.eventsByDate[date] && this.eventsByDate[date].length) {
                    events.push(...this.eventsByDate[date]);
                }
            }
            events = _.unique(events);
            // Set events
            this.renderEventSelector(events);
        },

        renderEventSelector: function(events) {
            // Render container
            const $eventList = $(
                QWeb.render("EventSelectorList", {events: events, widget: this})
            );
            // Render each event
            for (const event of events) {
                $eventList.append(
                    QWeb.render("EventSelectorListItem", {
                        widget: this,
                        event: event,
                        seats_available: this.pos.getEventSeatsAvailable(event),
                    })
                );
            }
            // Bind event handlers
            $eventList.on("click", "li:not(.disabled)", this.click_event.bind(this));
            // Add to dom
            this.$(".event-selector").html($eventList);
        },

        click_event: function(ev) {
            const $el = $(ev.currentTarget);
            const event_id = $el.data("id");
            const event = this.pos.db.get_event_by_id(event_id);
            // Optional update of available seats. Fails silently if no internet connection.
            // A final availability check is done before paying the order.
            this.pos
                .updateEventSeatsAvailable([event_id], {timeout: 1000, shadow: true})
                .catch(error => console.debug(error))
                .finally(() => {
                    this.gui.close_popup();
                    this.gui.show_popup("event-tickets", {
                        title: event.display_name,
                        event: event,
                    });
                });
        },

        /**
         *
         * @param {moment} startDate
         * @param {moment} endDate
         * @returns Array of dates between startDate and endDate in YYYY-MM-DD format
         */
        _getDatesInRange: function(startDate, endDate) {
            const days = endDate.diff(startDate, "days") + 1;
            return [...Array(days).keys()].map(dayn =>
                moment(startDate)
                    .add(dayn, "days")
                    .format("YYYY-MM-DD")
            );
        },

        /**
         * @param {eventsData} Array of events
         * @returns Object mapping events by date string YYYY-MM-DD
         */
        _getEventsByDate: function(events) {
            const res = {};
            for (const event of events) {
                const eventDates = this._getDatesInRange(
                    moment(event.date_begin),
                    moment(event.date_end)
                );
                for (const eventDate of eventDates) {
                    res[eventDate] = res[eventDate] || [];
                    res[eventDate].push(event);
                }
            }
            return res;
        },

        /**
         * We generate 1 fullcalendar event per available date
         * Do not confuse event.event objects with fullcalendar events.
         *
         * @param {eventsByDate} Object mapping events by date string YYYY-MM-DD
         * @returns array of fullcalendar events for this event
         */
        _getFullCalendarEvents: function(eventsByDate) {
            return Object.keys(eventsByDate).map(
                date => new Object({date: date, events: eventsByDate[date]})
            );
        },
    });

    gui.define_popup({name: "event-selector", widget: EventSelectorPopup});

    return EventSelectorPopup;
});
