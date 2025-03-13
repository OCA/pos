import {
        Component,
        onMounted,
        onWillUnmount,
        onWillUpdateProps,
        useState,
        useRef,
    } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { usePos } from "@point_of_sale/app/store/pos_hook";

export class EventCalendar extends Component {
    static template = "pos_event_calendar.EventCalendar";
    static props = {
        eventsByDate: {type: Object, optional: true},
        onSelectEvent: {type: Function, optional: true},
        onSelectDates: {type: Function, optional: true}
    };
    
    setup() {
        this.pos = usePos();
        this.state = useState({
            calendarLoaded: false,
            fallbackView: false,
        });

        this.calendarRef = useRef("calendarContainer");
        
        this.calendar = null;
        this.eventsByDate = this.props.eventsByDate || {};
        
        onMounted(() => this._onMounted());
        onWillUnmount(() => this._onWillUnmount());
        onWillUpdateProps((nextProps) => this._onWillUpdateProps(nextProps));
    }

    _onMounted() {
        setTimeout(() => {
            this._loadFullCalendarFromCDN()
            .then(() => {
                this._initializeCalendar();
            })
            .catch(error => {
                console.error("Failed to load FullCalendar:", error);
                this.state.fallbackView = true;
            });
        }, 100);
    }
    
    _loadFullCalendarFromCDN() {
        return new Promise((resolve, reject) => {
            if (typeof window.FullCalendar !== "undefined") {
                resolve();
                return;
            }
            
            const script = document.createElement("script");
            script.src = 
                "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.9/index.global.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    _initializeCalendar() {
        try {
            if (typeof window.FullCalendar === "undefined") {
                console.error("FullCalendar not available");
                this.state.fallbackView = true;
                return;
            }

            const calendarEl = this.calendarRef.el;
            if (!calendarEl) {
                console.error("Calendar container element not found");
                this.state.fallbackView = true;
                return;
            }
            const locale = navigator.language || "en";
            // FullCalendar v6
            this.calendar = new window.FullCalendar.Calendar(calendarEl, {
                initialView: "dayGridMonth",
                headerToolbar: {
                    left: "prev,next",
                    center: "title",
                    right: "today",
                },
                buttonText: {
                    today: _t("Today"),
                },
                locale: locale,
                firstDay: 1,
                selectable: true,
                unselectAuto: false,
                longPressDelay: 0,
                height: "100%",
                dayMaxEventRows: true,
                dayMaxEvents: 0,
                weekNumbers: false,
                views: {
                    dayGrid: {
                        dayHeaderClassNames: "fc-small-header",
                    },
                },
                contentHeight: 350,
                // events: this._getEvents(),
                eventClick: (info) => {
                    const originalEvent = info.event.extendedProps.originalEvent;
                    if (this.props.onSelectEvent) {
                        this.props.onSelectEvent({event: originalEvent});
                    }
                },
                select: ({start, end}) => {
                    if (this.props.onSelectDates) {
                        this.props.onSelectDates({ 
                            start: start,
                            end: end,
                        });
                    }
                },
                viewDidMount: () => {
                    setTimeout(() => this._refreshDayCells(), 100);
                },
                
                dayCellDidMount: (info) => {
                    this._updateDayCell(info);
                },
                dayCellWillUnmount: (info) => {
                    const {date, el} = info;
                    el.classList.remove("has-events");
                }
            });

            
            this.calendar.render();
            this.state.calendarLoaded = true;
        } catch (error) {
            console.error("Error initializing calendar:", error);
            this.state.fallbackView = true;
        }
    }

    _updateDayCell(info) {
        const {date, el} = info;
        if (this._hasEventsOnDate(date)) {
            el.classList.add("has-events");
        } else {
            el.classList.remove("has-events");
        }
    }

    _hasEventsOnDate(date) {
        if (!date) return false;
        const datekey = this._formatDateToYYYYMMDD(date);
        return this.eventsByDate[datekey] && this.eventsByDate[datekey].length > 0;
    }

    _formatDateToYYYYMMDD(date) {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) {
            console.error("Invalid date for formatting:", date);
            return "";
        }
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        
        return `${year}-${month}-${day}`;
    }
    


    _onWillUnmount() {
        if (this.calendar) {
            this.calendar.destroy();
            this.calendar = null;
        }
    }
    
    _onWillUpdateProps(nextProps) {
        if (nextProps.eventsByDate !== this.props.eventsByDate) {
            this.eventsByDate = nextProps.eventsByDate || {};
            
            if (this.calendar && this.state.calendarLoaded) {
                this.calendar.getEventSources().forEach((source) => source.remove());
                this._refreshDayCells();
            }
        }
    }
    
    _refreshDayCells() {
        if (!this.calendar) return;
        
        const dayCells = this.calendar.el.querySelectorAll(".fc-daygrid-day");
        dayCells.forEach((cell) => {
            const cellDate = cell.getAttribute("data-date");
            if (cellDate) {
                const hasEvents = this._hasEventsOnDate(new Date(cellDate));
                
                if (hasEvents) {
                    cell.classList.add("has-events");
                } else {
                    cell.classList.remove("has-events");
                }
            }
        });
    }

    _getEvents() {
        const events = [];
        
        // console.log("Calendar _getEvents with eventsByDate keys:", Object.keys(this.eventsByDate || {}));
        
        // Object.entries(this.eventsByDate || {}).forEach(([dateString, dateEvents]) => {
        //     console.log(`Processing date ${dateString} with ${dateEvents?.length || 0} events`);
        //     //! this is a special case, hesitations on creating events inside the calendar instead of using a simple bg color
        //     // if (Array.isArray(dateEvents) && dateEvents.length > 0) {
        //     //     dateEvents.forEach(event => {
        //     //         const eventObj = {
        //     //             id: `event-${event.id}`,
        //     //             title: event.name || 'Untitled Event',
        //     //             start: dateString,
        //     //             allDay: true,
        //     //             backgroundColor: '#007bff',
        //     //             borderColor: '#0056b3',
        //     //             textColor: '#ffffff',
        //     //             extendedProps: {
        //     //                 originalEvent: event
        //     //             }
        //     //         };
                    
        //     //         console.log(`Adding calendar event: ${event.name} on ${dateString}`);
        //     //         events.push(eventObj);
        //     //     });
        //     // }

        // });
        
        return events;
    }
    

    _hasEventsOnDate(date) {
        if (!date) return false;
        const dateKey = this._formatDateToYYYYMMDD(date);
        return this.eventsByDate[dateKey] && this.eventsByDate[dateKey].length > 0;
    }
    
    _formatDateToYYYYMMDD(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }
    
    
    
    handleEventClick(event) {
        if (this.props.onSelectEvent) {
            this.props.onSelectEvent({event});
        }
    }

    get events() {
        const allEvents = [];
        if (this.eventsByDate) {
            Object.values(this.eventsByDate).forEach((dateEvents) => {
                if (Array.isArray(dateEvents)) {
                    allEvents.push(...dateEvents);
                }
            });
        }
        return allEvents;
    }
}

export default EventCalendar;
