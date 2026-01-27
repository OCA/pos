odoo.define("pos_picking_load.db", function (require) {
    "use strict";

    var {Order} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    const PosPickingOrder = (Order) =>
        class PosPickingOrder extends Order {
            load_from_picking_data(picking_data) {
                var self = this;
                var partner = this.pos.db.get_partner_by_id(picking_data.partner_id);
                this.origin_picking_id = picking_data.id;
                this.origin_picking_name = picking_data.name;
                this.set_partner(partner);
                picking_data.line_ids.forEach(function (picking_line_data) {
                    // Create new line and add it to the current order
                    var product = self.pos.db.get_product_by_id(
                        picking_line_data.product_id
                    );
                    var order_line_data =
                        self.prepare_order_line_from_picking_line_data(
                            product,
                            picking_line_data
                        );
                    self.add_product(product, order_line_data);
                });
            }

            prepare_order_line_from_picking_line_data(product, picking_line_data) {
                return {
                    quantity: picking_line_data.quantity,
                    price: picking_line_data.price_unit || product.price,
                    discount: picking_line_data.discount || 0.0,
                };
            }

            export_for_printing() {
                var json = super.export_for_printing(...arguments);
                json.origin_picking_name = this.origin_picking_name;
                return json;
            }

            export_as_JSON() {
                const json = super.export_as_JSON(...arguments);
                json.origin_picking_id = this.origin_picking_id;
                json.origin_picking_name = this.origin_picking_name;
                return json;
            }

            init_from_JSON(json) {
                super.init_from_JSON(...arguments);
                this.origin_picking_id = json.origin_picking_id;
                this.origin_picking_name = json.origin_picking_name;
            }
        };
    Registries.Model.extend(Order, PosPickingOrder);
});
