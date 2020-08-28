odoo.define("pos_restricted_customer_list.point_of_sale.models", function(require) {
    "use strict";

    var Model = require("web.DataModel");
    var PosModels = require("point_of_sale.models");
    var PosModel = PosModels.PosModel;
    var PosModelSuper = PosModel.prototype;

    PosModels.PosModel = PosModel.extend({
        initialize: function(session, attributes) {
            var self = this;
            for (var i = 0; i < self.models.length; i++) {
                var model = self.models[i];
                var model_name = model.model;

                if (model_name === "res.partner") {
                    model.domain = self.prepare_load_new_partners_domain();
                }
            }
            return PosModelSuper.initialize.call(self, session, attributes);
        },
        prepare_load_new_partners_domain: function() {
            return [
                ["customer", "=", true],
                ["available_in_pos", "=", true],
            ];
        },
        load_new_partners: function() {
            var self = this;
            var def = new $.Deferred();
            var fields = _.find(this.models, function(model) {
                return model.model === "res.partner";
            }).fields;
            var domain = self.prepare_load_new_partners_domain();
            new Model("res.partner")
                .query(fields)
                .filter(domain)
                .all({timeout: 3000, shadow: true})
                .then(
                    function(partners) {
                        if (self.db.add_partners(partners)) {
                            // Check if the partners we got were real updates
                            def.resolve();
                        } else {
                            def.reject();
                        }
                    },
                    function(err, event) {
                        event.preventDefault();
                        def.reject();
                    }
                );
            return def;
        },
    });
});
