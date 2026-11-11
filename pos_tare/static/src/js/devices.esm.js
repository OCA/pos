/** @odoo-module **/
// SPDX-FileCopyrightText: 2026 Coop IT Easy SC
// SPDX-FileCopyrightText: 2026 GRAP
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {ProxyDevice} from "point_of_sale.devices";
import {patch} from "@web/core/utils/patch";

// Registries cannot be used to extend this class, as it is not present in it.
// This is why the class is patched like this.
patch(ProxyDevice.prototype, "pos_tare patch", {
    message: function (name, params) {
        if (this.scale_read_tare_param !== null && name === "scale_read") {
            params.tare = this.scale_read_tare_param;
        }
        return this._super(name, params);
    },
});
