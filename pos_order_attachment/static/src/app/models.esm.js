/** @odoo-module */
/*
    Copyright 2023 Dixmit
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/

import {Order} from "@point_of_sale/app/store/models";
import {patch} from "@web/core/utils/patch";

patch(Order.prototype, {
    setup() {
        this.message_attachment_count = 0;
        super.setup(...arguments);
    },
    init_from_JSON(json) {
        super.init_from_JSON(...arguments);
        this.message_attachment_count = json.message_attachment_count || 0;
    },
});
