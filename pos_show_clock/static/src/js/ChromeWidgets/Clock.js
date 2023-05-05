odoo.define("pos_show_clock.Clock", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const {useState} = owl;

    class Clock extends PosComponent {
        setup() {
            super.setup();
            this.state = useState({current_time: this.time});
        }

        get now() {
            return moment(Date.now());
        }

        get timeFormat() {
            return "HH:mm";
        }

        get time() {
            return this.now.format(this.timeFormat);
        }

        mounted() {
            this.intervalRef = setInterval(() => this.updateCurrentTime(), 1000);
        }

        willUnmount() {
            if (this.intervalReference) {
                clearInterval(this.intervalReference);
            }
        }

        updateCurrentTime() {
            if (this.time <= this.state.current_time) {
                return;
            }

            this.state.current_time = this.time;
        }
    }

    Clock.template = "Clock";

    Registries.Component.add(Clock);

    return Clock;
});
