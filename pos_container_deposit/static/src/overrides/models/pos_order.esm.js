/* Copyright 2024 Hunki Enterprises BV
 * Copyright 2026 Trobz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 */
import {PosOrder} from "@point_of_sale/app/models/pos_order";
import {patch} from "@web/core/utils/patch";

patch(PosOrder.prototype, {
    select_orderline(line) {
        /**
         * Never select a container deposit line, select the line next to it instead.
         **/
        if (line && line.is_container_deposit) {
            const lineIndex = this.lines.indexOf(line);
            const fallback = this.lines[lineIndex - 1] || this.lines[lineIndex + 1];
            super.select_orderline(fallback);
            return;
        }
        super.select_orderline(...arguments);
    },
    removeOrderline(line) {
        /**
         * Remove the container deposit line together with the line it belongs to.
         **/
        const depositLine = line && line.container_deposit_line_id;
        if (depositLine) {
            depositLine.delete();
        }
        return super.removeOrderline(...arguments);
    },
});
