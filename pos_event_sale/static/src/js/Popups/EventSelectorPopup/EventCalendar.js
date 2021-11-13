/*
    Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.EventCalendar", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class EventCalendar extends PosComponent {
        /**
         * Documentation here: https://fullcalendar.io/docs/v4/
         *
         * @returns fullcalendar options
         */
        _getCalendarOptions() {
            return {
                locale: moment.locale(),
                plugins: ["interaction", "dayGrid"],
                header: {
                    left: "title",
                    center: "",
                    right: "prev,next today",
                },
                buttonText: {
                    today: this.env._t("Today"),
                },
                selectable: true,
                unselectAuto: false,
                longPressDelay: 0,
                height: "auto",
                select: ({start, end}) => {
                    this.trigger("select-dates", {start, end});
                },
                dayRender: ({date, el}) => {
                    const datekey = moment(date).format("YYYY-MM-DD");
                    if (this.props.eventsByDate[datekey]) {
                        el.classList.add("has-events");
                    } else {
                        el.classList.remove("has-events");
                    }
                },
            };
        }
        mounted() {
            this.calendar = new window.FullCalendar.Calendar(
                this.el,
                this._getCalendarOptions()
            );
            this.calendar.render();
            // Select the current date
            this.calendar.select(moment().startOf("day").toDate());
        }
        willUnmount() {
            this.calendar.destroy();
        }
    }
    EventCalendar.template = "EventCalendar";

    Registries.Component.add(EventCalendar);
    return EventCalendar;
});
