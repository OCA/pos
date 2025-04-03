/* Copyright 2020 Akretion (https://www.akretion.com)
 * @author Raphaël Reverdy <raphael.reverdy@akretion.com>
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 */

import {PosOrder} from "@point_of_sale/app/models/pos_order";
import {patch} from "@web/core/utils/patch";

patch(PosOrder.prototype, {
    is_customer_required: function () {
        var order = this;
        var pricelist = order.pricelist_id;
        if (!pricelist) {
            return false;
        }
        return pricelist.pos_require_customer;
    },
});
