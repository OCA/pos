/*
    Copyright (C) 2023-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/

import {PosOrderline} from "@point_of_sale/app/models/pos_order_line";
import {patch} from "@web/core/utils/patch";

patch(PosOrderline.prototype, {
    can_be_merged_with(orderline) {
        const order = this.order_id;
        if (order.create_new_line) {
            return false;
        }
        return super.can_be_merged_with(orderline);
    },
});
