/* Copyright 2019 Tecnativa - David Vidal
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("pos_disable_lot_input.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");

    var _orderline_super = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        has_valid_product_lot: function () {
            // Disable warnings and blocks if lot input is disabled
            if (!this.pos.config.iface_lot_input) {
                return true;
            }
            return _orderline_super.has_valid_product_lot.apply(
                this, arguments);
        },
    });

    var _order_super = models.Order.prototype;
    models.Order = models.Order.extend({
        display_lot_popup: function () {
            // Inhibit popup
            if (this.pos.config.iface_lot_input || this.pos.allow_lot_popup) {
                this.pos.allow_lot_popup = false;
                return _order_super.display_lot_popup.apply(this, arguments);
            }
            this.pos.allow_lot_popup = false;
        },
    });

});
