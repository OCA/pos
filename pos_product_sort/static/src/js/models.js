/**
    Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_product_sort.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");
    var PosModelSuper = models.PosModel;

    models.PosModel = models.PosModel.extend({
        initialize: function (session, attributes) {
            var self = this;
            _.each(self.models, function (model) {
                if (model.model === "product.product") {
                    model.order = [{name: "name"}];
                }
            });
            return PosModelSuper.prototype.initialize.call(this, session, attributes);
        },
    });
});
