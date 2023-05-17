/*
    Copyright (C) 2023 KMEE (https://kmee.com.br)
    @author: Felipe Zago <felipe.zago@kmee.com.br>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/
odoo.define("pos_stock_scrap.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");
    const PosDB = require("point_of_sale.DB");

    PosDB.include({
        init: function (options) {
            this._super(options);

            this.scrap_reason_code_by_id = {};
        },

        add_scrap_reason_codes(reasons) {
            _.each(reasons, (reason) => {
                this.scrap_reason_code_by_id[reason.id] = reason;
            });
        },
    });

    models.load_models([
        {
            model: "scrap.reason.code",
            fields: ["id", "name"],
            loaded: function (self, reason_codes) {
                self.db.add_scrap_reason_codes(reason_codes);
            },
        },
    ]);

    return models;
});
