/*
Copyright (C) 2023-Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/
/*
    Copyright (C) 2023-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/

import {PosOrderline} from "@point_of_sale/app/models/pos_order_line";
import {patch} from "@web/core/utils/patch";

patch(PosOrderline.prototype, {
    can_be_merged_with(orderline) {
        if (!orderline.product_id.pos_mergeable_line) {
            return false;
        }
        return super.can_be_merged_with(orderline);
    },
});
//
//
// odoo.define("pos_product_mergeable_line.models", function (require) {
//    "use strict";
//
//    const {Orderline} = require("point_of_sale.models");
//    const Registries = require("point_of_sale.Registries");
//
//    const PosProductMergeableLineOrderline = (OriginalOrderline) =>
//        class extends OriginalOrderline {
//            can_be_merged_with(orderline) {
//                if (!orderline.product.pos_mergeable_line) {
//                    return false;
//                }
//                return super.can_be_merged_with(...arguments);
//            }
//        };
//    Registries.Model.extend(Orderline, PosProductMergeableLineOrderline);
//
//    return PosProductMergeableLineOrderline;
// });
