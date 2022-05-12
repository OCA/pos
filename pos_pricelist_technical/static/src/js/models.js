/**
Copyright (C) 2022 - Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**/

odoo.define("pos_pricelist_technical.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");

    var _PosModelSuper = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        initialize: function(session, attributes) {
            for (var i = 0 ; i < this.models.length; i++){
                if (this.models[i].model == "product.pricelist") {
                    this.models[i].fields.push("is_technical");
                }
            }
            return _PosModelSuper.initialize.apply(this, arguments);
        }
    });

});
