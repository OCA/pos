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
         * @param {Object} props.eventsByDate Mapping events to their dates.
         */
        constructor() {
            super(...arguments);
            this.eventsByDate = this.props.eventsByDate;
        }
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
                    if (this.hasEventsOnDate(date)) {
                        el.classList.add("has-events");
                    } else {
                        el.classList.remove("has-events");
                    }
                },
            };
        }
        /**
         * @returns {Boolean} True if there are events on this date
         * @param {Date} date
         */
        hasEventsOnDate(date) {
            const datekey = moment(date).format("YYYY-MM-DD");
            return this.eventsByDate[datekey] && this.eventsByDate[datekey].length;
        }
        /**
         * Forces a re-render of the DayGrid cells.
         */
        renderDayGrid() {
            // NOTE: This code is taken from fullcalendar's private implementation
            // because there's no public API to do this, apparently.
            const dayGrid = this.calendar.view.dayGrid;
            const {rowCnt, colCnt} = dayGrid;
            const {cells} = dayGrid.props;
            const {dateEnv} = dayGrid.context;
            for (let row = 0; row < rowCnt; row++) {
                for (let col = 0; col < colCnt; col++) {
                    this.calendar.publiclyTrigger("dayRender", [
                        {
                            date: dateEnv.toDate(cells[row][col].date),
                            el: dayGrid.getCellEl(row, col),
                            view: dayGrid.view,
                        },
                    ]);
                }
            }
        }
        /**
         * @override
         */
        mounted() {
            this.calendar = new window.FullCalendar.Calendar(
                this.el,
                this._getCalendarOptions()
            );
            this.calendar.render();
            // Select the current date
            this.calendar.select(moment().startOf("day").toDate());
        }
        /**
         * @override
         */
        willUnmount() {
            this.calendar.destroy();
        }
        /**
         * @override
         */
        willUpdateProps(nextProps) {
            const {eventsByDate} = nextProps;
            if (this.eventsByDate !== eventsByDate) {
                this.eventsByDate = eventsByDate;
                this.renderDayGrid();
            }
        }
    }
    EventCalendar.template = "EventCalendar";

    Registries.Component.add(EventCalendar);
    return EventCalendar;
});
