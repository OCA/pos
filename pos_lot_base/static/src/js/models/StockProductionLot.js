/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/
odoo.define("pos_lot_base.StockProductionLot", function (require) {
    "use strict";

    const models = require("point_of_sale.models");

    models.StockProductionLot = window.Backbone.Model.extend({
        initialize: function (attr, options) {
            _.extend(this, options);
        },
    });
});
