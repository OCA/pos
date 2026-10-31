// Copyright 2026 INVITU (https://www.invitu.com)
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import {ControlButtons} from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons";
import {patch} from "@web/core/utils/patch";

patch(ControlButtons.prototype, {
    get showKitchenReprintButton() {
        // Only orders already sent to the kitchen, so an unpaid order
        // never reaches the kitchen before payment outside restaurant mode.
        const lines = this.currentOrder?.last_order_preparation_change?.lines || {};
        return this.pos.hasKitchenPrinter && Object.keys(lines).length > 0;
    },
});
