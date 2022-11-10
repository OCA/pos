odoo.define("pos_show_clock.Clock", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const {useState} = owl;

    class Clock extends PosComponent {
        setup() {
            super.setup();
            this.state = useState({current_time: ""});
            this.mounted();
        }
        mounted() {
            this.updateCurrentTime();
        }
        updateCurrentTime() {
            const now = Date.now();
            const next_update = 60050 - parseInt(moment(now).format("ss")) * 1000;
            // 1 min = 60.000ms
            // 60000 + 50 (less then 100ms rule)
            // it's the time we can update the minute without the user noticing
            // the difference when comparing it to another watch.
            this.state.current_time = moment(now).format("HH:mm");
            this.invervalReference = setInterval(() => {
                this.updateCurrentTime();
            }, next_update);
        }
        unmount() {
            clearInterval(this.intervalReference);
        }
        get time() {
            return this.state.current_time;
        }
    }

    Clock.template = "Clock";

    Registries.Component.add(Clock);

    return Clock;
});
