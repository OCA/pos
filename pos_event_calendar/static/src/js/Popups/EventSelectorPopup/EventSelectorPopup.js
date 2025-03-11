import { _t } from "@web/core/l10n/translation";
import { Component, onMounted, useRef, useState, useExternalListener } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { Dialog } from "@web/core/dialog/dialog";
import EventCalendar from "./EventCalendar";
import EventList from "./EventList";
import EventItem from "./EventItem";
import EventFilter from "./EventFilter";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { EventConfiguratorPopup } from "@pos_event/app/popup/event_configurator_popup/event_configurator_popup";
import { EventRegistrationPopup } from "@pos_event/app/popup/event_registration_popup/event_registration_popup";
import { makeAwaitable } from "@point_of_sale/app/store/make_awaitable_dialog";

const { DateTime } = luxon;

export class EventSelectorPopup extends Component {
    
    static template = "pos_event_calendar.EventSelectorPopup";
    static components = { Dialog, EventCalendar, EventList, EventItem, EventFilter };
    static props = {
        product: { type: Object, optional: true },
        close: Function,
    };

    setup() {
        super.setup();
        this.pos = usePos();
        this.dialog = useService("dialog");
        this.notification = useService("notification");
        this.dialogState = useState({
            selectedStartDate: DateTime.now().startOf("day").toJSDate(),
            selectedEndDate: DateTime.now().endOf("day").toJSDate(),
            filters: [],

            isHidden: false,
        });

        useExternalListener(window, "select-dates", this.selectDates.bind(this));
        useExternalListener(window, "click-event", this.clickEvent.bind(this));

        this._events = null;
        this._eventsByDate = null;

        if (this.props.product) {
            this.dialogState.filters.push({
                kind: "product",
                data: this.props.product.id,
                label: _t("Product"),
                value: this.props.product.display_name,
            });
        }

        onMounted(this.willStart.bind(this));
    }

    async willStart() {
        try {
            // nothing here
        } catch (error) {
            console.error("Error in willStart:", error);
        }
    }

    get eventsToDisplay() {
        const selectedDate = new Date(this.dialogState.selectedStartDate);
        const dateKey = this.formatDateToYYYYMMDD(selectedDate);
        const events = this.eventsByDate[dateKey] || [];
        
        return events;
    }

    get eventsByDate() {
        if (!this._eventsByDate) {
            this._eventsByDate = {};
            const events = this.events;
            
            for (const event of events) {
                const dateKey = this.formatDateToYYYYMMDD(event.date_begin_located);
                
                if (!dateKey) {
                    continue;
                }
                
                if (!this._eventsByDate[dateKey]) {
                    this._eventsByDate[dateKey] = [];
                }
                
                this._eventsByDate[dateKey].push(event);
            }
        }
        return this._eventsByDate;
    }

    formatDateToYYYYMMDD(date) {

        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    

    /**
     * Helper method to get dates for an event
     */
    getEventDates(event) {
        const dates = [];
        if (event.date_begin) {
            try {
                const startDate = DateTime.fromISO(event.date_begin).startOf('day').toJSDate();
                dates.push(startDate);
                
                if (event.date_end) {
                    const endDate = DateTime.fromISO(event.date_end).startOf('day');
                    let currentDate = DateTime.fromJSDate(startDate).plus({ days: 1 });
                    
                    while (currentDate <= endDate) {
                        dates.push(currentDate.toJSDate());
                        currentDate = currentDate.plus({ days: 1 });
                    }
                }
            } catch (error) {
                console.error("Error parsing event dates:", error);
            }
        }
        return dates;
    }

    /**
     * Filter the full event list based on applied filters.
     */
    get events() {
        if (!this._events) {
            if (!this.pos || !this.pos.models || !this.pos.models["event.event"]) {
                console.warn("No events available in POS");
                return [];
            }
            
            const allEvents = this.pos.models["event.event"].getAll();
            
            this._events = allEvents.filter(event => this._applyFilters(event));
        }
        return this._events;
    }

    /**
     * Apply all filters to a single event
     */
    _applyFilters(event) {
        return this.dialogState.filters.every(filter => this._applyFilter(event, filter));
    }

    /**
     * Apply a specific filter to an event
     */
    _applyFilter(event, filter) {
        if (filter.kind === "product") {
            const ticketsWithProduct = this.pos.models["event.event.ticket"].getAll()
                .filter(ticket => 
                    ticket.event_id[0] === event.id && 
                    ticket.product_id && 
                    ticket.product_id[0] === filter.data
                );
            
            return ticketsWithProduct.length > 0;
        }
        
        if (filter.kind === "search") {
            const { fieldName, searchTerm } = filter.data;
            //split and replace special characters with letters (like é -> e)
            const terms = searchTerm.replace(/[^\w\s]/gi, "").split(" ");
            const matches = (source, terms) =>
                terms.every((term) => source.toLowerCase().includes(term.toLowerCase()));

            let fieldValue = "";
            if (fieldName.endsWith("_id")) {
                fieldValue = event[fieldName] ? event[fieldName][1] : "";
            } else {
                fieldValue = event[fieldName] || "";
            }

            return matches(fieldValue, terms);
        }
        
        if (filter.kind === "tags") {
            const { tagIds } = filter.data;
            if (!tagIds || !tagIds.length) return true;
            
            if (!event.tag_ids || !Array.isArray(event.tag_ids)) {
                return false;
            }
            
            return event.tag_ids.some(tag => {
                const tagId = typeof tag === 'object' ? tag.id : tag;
                return tagIds.includes(tagId);
            });
        }
        
        if (filter.kind === "tag") {
            return event.tag_ids && event.tag_ids.some(tag => {
                const tagId = typeof tag === 'object' ? tag.id : tag;
                return tagId === filter.data.tagID;
            });
        }
        
        return true;
    }

    /**
     * Handle date changes from the date range picker.
     */
    selectDates(eventData) {     
        try {
            let start;
            if (eventData.start instanceof Date) {
                start = eventData.start;
            } else {
                start = new Date(eventData.start);
            }
            
            this.dialogState.selectedStartDate = start;
            this.dialogState.selectedEndDate = start;
            
            this._events = null;
            this._eventsByDate = null;
            
            this.render();
        } catch (error) {
            console.error("Error in selectDates:", error);
        }
    }


    /**
     * Handle filter changes triggered externally.
     */
    onFiltersChange(filters) {
        console.log("Filters changed:", filters);
        this._events = null;
        this._eventsByDate = null;
        this.dialogState.filters = filters;
        
        this.render();
    }

    /**
     * Handle click on a specific event.
     */
    async clickEvent(ev) {
            try {
                const event = ev;
                
                if (event.seats_available === 0 && event.seats_limited) {
                    this.notification.add(_t("No more seats available for this event"), {
                        type: "danger",
                    });
                    return;
                }
                
                const tickets = event.event_ticket_ids.filter(
                    (ticket) => ticket.product_id && ticket.product_id.service_tracking === "event"
                );
                
                if (!tickets || tickets.length === 0) {
                    this.notification.add(_t("No tickets available for this event."), {
                        type: "warning",
                    });
                    return;
                }
                this.closeDialog();
                const ticketResult = await makeAwaitable(this.dialog, EventConfiguratorPopup, {
                    tickets: tickets,
                });
                
                if (!ticketResult || !ticketResult.length) {
                    return;
                }
                
                const result = await makeAwaitable(this.dialog, EventRegistrationPopup, {
                    event: event,
                    data: ticketResult,
                });
                
                if (!result || !result.byRegistration || !Object.keys(result.byRegistration).length) {
                    return;
                }
                
                const { globalSimpleChoice, globalTextAnswer } = Object.entries(result.byOrder).reduce(
                    (acc, [questionId, answer]) => {
                        const question = this.pos.models["event.question"].get(parseInt(questionId));
                        if (
                            question.question_type === "simple_choice" &&
                            this.pos.models["event.question.answer"].get(parseInt(answer))
                        ) {
                            acc.globalSimpleChoice[questionId] = answer;
                        } else if (answer) {
                            acc.globalTextAnswer[questionId] = answer;
                        }
    
                        return acc;
                    },
                    { globalSimpleChoice: {}, globalTextAnswer: {} }
                );
                
                for (const [ticketId, data] of Object.entries(result.byRegistration)) {
                    const ticket = this.pos.models["event.event.ticket"].get(parseInt(ticketId));
                    const line = await this.pos.addLineToCurrentOrder({
                        product_id: ticket.product_id,
                        price_unit: ticket.price,
                        qty: data.length,
                        event_ticket_id: ticket,
                    });
                    
                    for (const registration of data) {
                        const userData = {};
                        
                        for (const [questionId, answer] of Object.entries(registration)) {
                            const question = this.pos.models["event.question"].get(parseInt(questionId));
                            
                            if (!question) continue;
                            
                            if (question.question_type === "email") {
                                userData.email = answer;
                            } else if (question.question_type === "phone") {
                                userData.phone = answer;
                            } else if (question.question_type === "name") {
                                userData.name = answer;
                            } else if (question.question_type === "company") {
                                userData.company = answer;
                            }
                        }
                        
                        const { simpleChoice, textAnswer } = Object.entries(registration).reduce(
                            (acc, [questionId, answer]) => {
                                const question = this.pos.models["event.question"].get(parseInt(questionId));
                                if (
                                    question.question_type === "simple_choice" &&
                                    this.pos.models["event.question.answer"].get(parseInt(answer))
                                ) {
                                    acc.simpleChoice[questionId] = answer;
                                } else if (answer) {
                                    acc.textAnswer[questionId] = answer;
                                }
                                
                                return acc;
                            },
                            { simpleChoice: {}, textAnswer: {} }
                        );
                        
                        this.pos.models["event.registration"].create({
                            ...userData,
                            event_id: event,
                            event_ticket_id: ticket,
                            pos_order_line_id: line,
                            partner_id: this.pos.get_order().partner_id,
                            registration_answer_ids: Object.entries({
                                ...textAnswer,
                                ...globalTextAnswer,
                            }).map(([questionId, answer]) => [
                                "create",
                                {
                                    question_id: this.pos.models["event.question"].get(parseInt(questionId)),
                                    value_text_box: answer,
                                },
                            ]),
                            registration_answer_choice_ids: Object.entries({
                                ...simpleChoice,
                                ...globalSimpleChoice,
                            }).map(([questionId, answer]) => [
                                "create",
                                {
                                    question_id: this.pos.models["event.question"].get(parseInt(questionId)),
                                    value_answer_id: this.pos.models["event.question.answer"].get(parseInt(answer)),
                                },
                            ]),
                        });
                    }
                }
                
            } catch (error) {
                console.error("Error in clickEvent:", error);
                this.notification.add(_t("An error occurred while processing the event selection."), {
                    type: "danger",
                });
            }
    }

    closeDialog() {
        this.props.close();
    }
}
