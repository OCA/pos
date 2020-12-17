/** ****************************************************************************
 * Copyright (C) 2015-2016 Akretion (<http://www.akretion.com>).
 * Copyright (C) 2017-TODAY Camptocamp SA (<http://www.camptocamp.com>).
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 ******************************************************************************/

odoo.define("pos_remove_pos_category.models", function (require) {
    "use strict";

    var pos_models = require("point_of_sale.models");

    var _pos_super = pos_models.PosModel.prototype;
    pos_models.PosModel = pos_models.PosModel.extend({
        initialize: function (session, attributes) {
            for (var i = 0; i < this.models.length; i++) {
                if (this.models[i].model == "pos.category") {
                    this.models[i].model = "product.category";
                    this.models[i].domain = [["available_in_pos", "=", true]];
                }
            }
            return _pos_super.initialize.apply(this, arguments);
        },
    });
});
