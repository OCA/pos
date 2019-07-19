/* Copyright 2019 Tecnativa - David Vidal
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
odoo.define('pos_disable_lot_input.screens', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');

    screens.OrderWidget.include({
        show_product_lot: function (orderline) {
            // Flag to catch on the `display_lot_popup` function to enable
            // the lot input when the line widget is clicked.
            this.pos.allow_lot_popup = true;
            return this._super.apply(this, arguments);
        },
    });
});
