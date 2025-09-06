/** @odoo-module **/

import { Component, onMounted, useState } from "@odoo/owl";

/**
 * POS Date filter component.
 */
export class PosDatePicker extends Component {
    static template = "PosDatePicker";
    static props = {
        onDateChange: { type: Function, optional: true }
    };

    setup() {
        super.setup();
        this.state = useState({ selectedDate: null });

        onMounted(() => {
            const dateInput = document.getElementById("dateSelected");
            if (dateInput) {
                dateInput.addEventListener("change", this.setDate.bind(this));
            }
        });
    }

    toggleDatePicker(){
        const selectedDate = document.getElementById("selectedDate");
        if (selectedDate.style.display === "none" || selectedDate.style.display === "") {
            selectedDate.style.display = "block";
        } else {
            selectedDate.style.display = "none";
        }
    }

    setDate(event) {
        const newDate = event.target.value;

        this.state.selectedDate = newDate;
        if (this.props.onDateChange && typeof this.props.onDateChange === "function") {
            this.props.onDateChange(newDate);
        }
        document.getElementById("selectedDate").style.display = "none";
    }

}
