// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

odoo.define("pos_self_service_weight_base.WeightWidget", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    const {onMounted, onWillUnmount, useState} = owl;

    class WeightWidget extends PosComponent {
        setup() {
            super.setup();
            this.state = useState({weight: 0});
            onMounted(this.onMounted);
            onWillUnmount(this.onWillUnmount);
        }
        onMounted() {
            // Start the scale reading
            this._readScale();
        }
        onWillUnmount() {
            // Stop the scale reading
            this.env.proxy_queue.clear();
        }
        _readScale() {
            this.env.proxy_queue.schedule(this._setWeight.bind(this), {
                duration: 500,
                repeat: true,
            });
        }
        async _setWeight() {
            const reading = await this.env.proxy.scale_read();
            this.state.weight = reading.weight;
        }
        get weightString() {
            const weightstr = (this.state.weight || 0).toFixed(3) + " kg";
            return weightstr;
        }
    }

    WeightWidget.template = "pos_self_service_weight_base.WeightWidget";

    Registries.Component.add(WeightWidget);

    return WeightWidget;
});
