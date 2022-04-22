// Copyright 2022 Coop IT Easy SCRLfs
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

odoo.define("pos_customer_wallet.screens", function (require) {
    "use strict";
    var models = require("point_of_sale.models");
    var rpc = require("web.rpc");

    models.PosModel = models.PosModel.extend({
        load_partners_by_ids: function (ids) {
            var self = this;
            var def = new $.Deferred();
            var fields = _.find(this.models, function (model) {
                return model.model === "res.partner";
            }).fields;

            rpc.query(
                {
                    model: "res.partner",
                    method: "read",
                    args: [ids, fields],
                },
                {
                    timeout: 3000,
                    shadow: true,
                }
            ).then(
                function (partners) {
                    // Context: `add_partners` fetches partner models from the
                    // Odoo database and inserts those models into its own db.
                    // As an efficiency measure, it does not insert partner
                    // models if their `write_date` is LESS recent than the last
                    // time it recorded that a partner model was successfully
                    // added to the pos db. Computed fields do not normally
                    // increase `write_date`. Therefore, to make sure that
                    // computed fields also get updated, just reset the cached
                    // date to the Unix epoch.
                    self.db.partner_write_date = "1970-01-01 00:00:00";

                    if (self.db.add_partners(partners)) {
                        // check if the partners we got were real updates
                        def.resolve();
                    } else {
                        def.reject();
                    }
                },
                function (type, err) {
                    def.reject();
                }
            );
            return def;
        },
    });
});
