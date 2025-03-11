import { Component, useState } from "@odoo/owl";
import EventItem from "./EventItem";

export class EventList extends Component {
    static template = "pos_event_calendar.EventList";
    static components = { EventItem };
    static props = {
        events: { type: Array, required: true },
        onClickEvent: { type: Function, optional: true },
    };

    setup() {
        this.state = useState({ selectedEvent: null });
    }
    
    handleEventSelect(event) {
        this.state.selectedEvent = event;
        if (this.props.onClickEvent) {
            this.props.onClickEvent(event);
        }
    }
}

export default EventList;
