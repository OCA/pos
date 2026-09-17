/** @odoo-module */
/*
    Copyright (C) 2023-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/

import {Orderline} from "@point_of_sale/app/store/models";
import {patch} from "@web/core/utils/patch";

patch(Orderline.prototype, {
    can_be_merged_with(orderline) {
        const order = this.pos.get_order();
        if (order.create_new_line) {
            return false;
        }
        return super.can_be_merged_with(orderline);
    },
});
