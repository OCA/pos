/* Copyright 2020 Akretion (https://www.akretion.com)
 * @author Raphaël Reverdy <raphael.reverdy@akretion.com>
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("pos_require_customer.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");

    models.PosModel.prototype.models.some(function (model) {
        if (model.model !== "product.pricelist") {
            return false;
        }
        model.fields.push("pos_require_customer");
        return true; // Exit early the iteration of this.models
    });

    models.Order = models.Order.extend({
        is_customer_required: function () {
            var order = this;
            var pricelist = order.pricelist;
            return pricelist.pos_require_customer;
        },
    });
});
