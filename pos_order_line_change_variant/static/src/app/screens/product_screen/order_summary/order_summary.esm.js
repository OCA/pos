/* Copyright 2026 INVITU (https://www.invitu.com)
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html). */

import {OrderSummary} from "@point_of_sale/app/screens/product_screen/order_summary/order_summary";
import {patch} from "@web/core/utils/patch";

patch(OrderSummary.prototype, {
    // Clicking an already-selected, configurable line opens the variant
    // configurator instead of scheduling its deselection.
    clickLine(ev, orderline) {
        if (
            ev.detail !== 2 &&
            orderline.isSelected() &&
            orderline.product_id.isConfigurable()
        ) {
            ev.stopPropagation();
            this.numberBuffer.reset();
            this.pos.changeOrderlineVariant(orderline);
            return;
        }
        super.clickLine(ev, orderline);
    },
});
