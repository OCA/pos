/** @odoo-module **/
// SPDX-FileCopyrightText: 2026 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {ProxyDevice} from "point_of_sale.devices";
import {patch} from "@web/core/utils/patch";

const WEIGHT_UNIT = "Kg";
const OK_STATUS = "ok";
const DEFAULT_WEIGHT = 0.0;

// Registries cannot be used to extend this class, as it is not present in it.
// This is why the class is patched like this.
patch(ProxyDevice.prototype, "pos_tare patch", {
    _scale_response: function (weight) {
        return {weight: weight, unit: WEIGHT_UNIT, info: OK_STATUS};
    },
    scale_read_with_tare: async function (tare) {
        // This is the same method as scale_read() except that it provides the
        // tare as an argument.
        if (this.use_debug_weight) {
            return this._scale_response(this.debug_weight);
        }
        try {
            return await this.message("scale_read", {tare: tare});
        } catch (e) {
            // Failed to read weight
            return this._scale_response(DEFAULT_WEIGHT);
        }
    },
});
