/** ***************************************************************************
    Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
******************************************************************************/

odoo.define('pos_picking_load.model', function (require) {
    "use strict";

    var models = require('point_of_sale.models');

    /** **********************************************************************
        Extend Model Order:
            * Add getter and setter function for field 'origin_picking_id';
    */

    var moduleOrderParent = models.Order;
    models.Order = models.Order.extend({

        load_from_picking_data: function (picking_data) {
            var self = this;

            var partner = this.pos.db.get_partner_by_id(
                picking_data.partner_id);

            this.set({
                'origin_picking_id': picking_data.id,
                'origin_picking_name': picking_data.name,
            });
            this.set_client(partner);

            picking_data.line_ids.forEach(function (picking_line_data) {
                // Create new line and add it to the current order
                var product = self.pos.db.get_product_by_id(
                    picking_line_data.product_id);
                var order_line_data =
                    self.prepare_order_line_from_picking_line_data(
                        product, picking_line_data);
                self.add_product(product, order_line_data);
            });
        },

        prepare_order_line_from_picking_line_data: function (
            product, picking_line_data) {
            return {
                quantity: picking_line_data.quantity,
                price: picking_line_data.price_unit || product.price,
                discount: picking_line_data.discount || 0.0,
            };
        },

        export_for_printing: function () {
            var order = moduleOrderParent.prototype.export_for_printing.apply(
                this, arguments);
            order.origin_picking_name = this.get('origin_picking_name');
            return order;
        },

        export_as_JSON: function () {
            var order = moduleOrderParent.prototype.export_as_JSON.apply(
                this, arguments);
            order.origin_picking_id = this.get('origin_picking_id');
            order.origin_picking_name = this.get('origin_picking_name');
            return order;
        },

        init_from_JSON: function (json) {
            moduleOrderParent.prototype.init_from_JSON.apply(this, arguments);
            this.set({
                'origin_picking_id': json.origin_picking_id,
                'origin_picking_name': json.origin_picking_name,
            });
        },

    });

});
