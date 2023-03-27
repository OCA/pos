/*
Copyright (C) 2023-Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_product_mergeable_line.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");

    models.load_fields("product.product", ["pos_mergeable_line"]);

    const OrderlineSuper = models.Orderline.prototype;

    models.Orderline = models.Orderline.extend({
        can_be_merged_with: function(orderline){
            if (! orderline.product.pos_mergeable_line) {
                return false;
            }
            return OrderlineSuper.can_be_merged_with.apply(this, arguments);
        },
    });

    return models;
});
