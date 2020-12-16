odoo.define("pos_restricted_customer_list.point_of_sale.models", function(require) {
    "use strict";

    var rpc = require("web.rpc");
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
                ["available_in_pos", "=", true],
            ];
        },
        load_new_partners: function(){
            var self = this;
            return new Promise(function (resolve, reject) {
                var fields = _.find(self.models, function(model){ return model.label === 'load_partners'; }).fields;
                var domain = self.prepare_load_new_partners_domain();
                rpc.query({
                    model: 'res.partner',
                    method: 'search_read',
                    args: [domain, fields],
                }, {
                    timeout: 3000,
                    shadow: true,
                })
                .then(function (partners) {
                    if (self.db.add_partners(partners)) {   // check if the partners we got were real updates
                        resolve();
                    } else {
                        reject();
                    }
                }, function (type, err) { reject(); });
            });
        },
    });
});
