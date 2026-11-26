/** @odoo-module */

/* eslint-disable no-unused-vars */
import {Component, onMounted, onWillUnmount, useState} from "@odoo/owl";
import {Navbar} from "@point_of_sale/app/navbar/navbar";
import {parseDateTime} from "@web/core/l10n/dates";

class Clock extends Component {
    setup() {
        super.setup();
        this.state = useState({current_time: this.time});
        onMounted(() => {
            this.intervalRef = setInterval(() => this.updateCurrentTime(), 1000);
        });
        onWillUnmount(() => {
            if (this.intervalRef) {
                clearInterval(this.intervalRef);
            }
        });
    }

    get time() {
        return new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    updateCurrentTime() {
        if (this.time <= this.state.current_time) {
            return;
        }

        this.state.current_time = this.time;
    }
}

Clock.template = "Clock";

Navbar.components = {
    ...Navbar.components,
    Clock: Clock,
};
