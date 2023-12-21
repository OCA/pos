/** @odoo-module alias=pos_self_service_weighing_base.WeightWidget **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {onMounted, onWillUnmount, useState} from "@odoo/owl";
import PosComponent from "point_of_sale.PosComponent";
import Registries from "point_of_sale.Registries";

class WeightWidget extends PosComponent {
    get weightString() {
        const weightstr = (this.state.weight || 0).toFixed(3) + " kg";
        return weightstr;
    }

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
}

WeightWidget.template = "pos_self_service_weighing_base.WeightWidget";
Registries.Component.add(WeightWidget);
export default WeightWidget;
