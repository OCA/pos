odoo.define("pos_disable_pricelist_selection.PosModel", function (require) {
    "use strict";

    var models = require("point_of_sale.models");
    var posmodel_super = models.PosModel.prototype;

    models.PosModel = models.PosModel.extend({
        load_server_data: function () {
            this.models.push({
                model: "product.pricelist",
                fields: ["name", "display_name", "discount_policy"],
                domain: function (self) {
                    if (self.config.use_pricelist) {
                        if (self.config.hide_pricelist_button) {
                            return [["id", "in", self.config.available_pricelist_ids]];
                        }
                        return [["id", "in", self.config.selectable_pricelist_ids]];
                    }
                    return [["id", "=", self.config.pricelist_id[0]]];
                },
                loaded: function (self, pricelists) {
                    _.map(pricelists, function (pricelist) {
                        pricelist.items = [];
                    });
                    self.selectable_pricelists = pricelists;
                },
            });
            return posmodel_super.load_server_data.apply(this, arguments);
        },
    });
});
