/* Copyright 2018 Akretion - Raphaël Reverdy
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
odoo.define("pos_fix_search_limit.db", function (require) {
    "use strict";
    var PosDB = require("point_of_sale.DB");
    PosDB.include({
        limit: 100, // The maximum number of results returned by a search
    });
});
