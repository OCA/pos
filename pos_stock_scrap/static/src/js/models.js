/*
    Copyright (C) 2016-Today KMEE (https://kmee.com.br)
    @author: Felipe Zago <felipe.zago@kmee.com.br>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/
odoo.define("pos_stock_scrap.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");

    models.load_models([
        {
            model: "scrap.reason.code",
            fields: ["id", "name"],
            loaded: function (self, reason_codes) {
                self.scrap_reason_codes = reason_codes;
            },
        },
    ]);

    return models;
});
