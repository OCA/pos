import { Component, useState, onWillRender } from "@odoo/owl";

const { DateTime } = luxon;
const locale = navigator.language || 'en';

export class EventItem extends Component {
    static template = "pos_event_calendar.EventItem";
    static props = {
        event: { type: Object, required: true },
        onSelectEvent: { type: Function, optional: true },
    };

    setup() {
        this.state = useState({
        
        });
        
        onWillRender(this.willRender.bind(this));
    }
    
    willRender() {
       
    }
    
    get disabled() {
        
    }
    
    get addedClasses() {
        const classes = ["event-item", "card", "mb-2", "cursor-pointer"];
        
        if (this.disabled) {
            classes.push("disabled", "opacity-50");
        }
        
        return classes.join(" ");
    }
    
    formatDate(dateStr) {
        if (!dateStr) return '';
        
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                return dateStr;
            }
            
            return new Intl.DateTimeFormat(navigator.language, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateStr;
        }
    }

    getDayName(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase();
    }
    getDayNumber(dateString) {
        const date = new Date(dateString);
        return date.getDate();
    }
    getMonthName(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, { month: 'short' }).toUpperCase();
    }
    getStartTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    getEndTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    isSameDay(dateBegin, dateEnd) {
        const start = new Date(dateBegin);
        const end = new Date(dateEnd);
        return start.getDate() === end.getDate() && 
               start.getMonth() === end.getMonth() && 
               start.getFullYear() === end.getFullYear();
    }
    
    formatDateDisplay(event) {
        if (this.isSameDay(event.date_begin_located, event.date_end_located)) {
            return {
                left: {
                    dayName: this.getDayName(event.date_begin_located),
                    dayNumber: this.getDayNumber(event.date_begin_located),
                    monthName: this.getMonthName(event.date_begin_located)
                },
                right: {
                    startTime: this.getStartTime(event.date_begin_located),
                    endTime: this.getEndTime(event.date_end_located)
                }
            };
        } else {
            return {
                left: {
                    dayName: this.getDayName(event.date_begin_located),
                    dayNumber: this.getDayNumber(event.date_begin_located),
                    monthName: this.getMonthName(event.date_begin_located),
                    startTime: this.getStartTime(event.date_begin_located)
                },
                right: {
                    dayName: this.getDayName(event.date_end_located),
                    dayNumber: this.getDayNumber(event.date_end_located),
                    monthName: this.getMonthName(event.date_end_located),
                    endTime: this.getEndTime(event.date_end_located)
                }
            };
        }
    }
    
    
    clickEvent() {
        if (!this.disabled && this.props.onSelectEvent) {
            this.props.onSelectEvent(this.props.event);
        }
    }
}

export default EventItem;
