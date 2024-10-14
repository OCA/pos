odoo.define("pos_tare.models", function (require) {
    "use strict";

    const {Order, Orderline} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");
    const pos_tare_tools = require("pos_tare.tools");

    const overloadOrder = (Order_) =>
        class extends Order_ {
            add_product(product, options) {
                const res = super.add_product.call(this, product, options);
                if (options.tare !== undefined) {
                    this.get_last_orderline().set_tare(options.tare);
                }
                return res;
            }
        };
    Registries.Model.extend(Order, overloadOrder);

    const overloadOrderline = (Orderline_) =>
        class extends Orderline_ {
            // /////////////////////////////
            // Overload Section
            // /////////////////////////////
            constructor(obj, options) {
                super(obj, options);
                this.tare = 0;
            }

            init_from_JSON(json) {
                super.init_from_JSON(json);
                this.tare = json.tare || 0;
            }

            clone() {
                let order_line = super.clone();
                order_line = this.tare;
                return order_line;
            }

            export_as_JSON() {
                const json = super.export_as_JSON();
                json.tare = this.get_tare();
                return json;
            }

            export_for_printing() {
                const order_line = super.export_for_printing(...arguments);
                order_line.tare_quantity = this.get_tare();
                order_line.gross_quantity = this.get_gross_weight();
                return order_line;
            }

            // /////////////////////////////
            // Custom Section
            // /////////////////////////////
            set_tare(quantity, update_net_weight) {
                this.order.assert_editable();

                // Prevent to apply multiple times a tare to the same product.
                if (this.get_tare() > 0) {
                    // This is valid because the tare is stored using product UOM.
                    this.set_quantity(this.get_quantity() + this.get_tare());
                    this.reset_tare();
                }

                // We convert the tare that is always measured in the same UoM into
                // the unit of measure for this order line.
                const tare_uom = this.pos.config.iface_tare_uom_id[0];
                const tare_unit = this.pos.units_by_id[tare_uom];
                const tare = parseFloat(quantity) || 0;
                const line_unit = this.get_unit();
                const tare_in_product_uom = pos_tare_tools.convert_mass(
                    tare,
                    tare_unit,
                    line_unit
                );
                if (update_net_weight) {
                    const net_quantity = this.get_quantity() - tare_in_product_uom;
                    // Update the quantity with the new weight net of tare quantity.
                    this.set_quantity(net_quantity);
                }
                // Update tare value.
                this.tare = tare_in_product_uom;
            }

            reset_tare() {
                this.tare = 0;
            }

            get_tare() {
                return this.tare;
            }

            get_gross_weight() {
                return this.get_tare() + this.get_quantity();
            }

            get_tare_str_with_unit() {
                const unit = this.get_unit();
                const tare_str = pos_tare_tools.format_tare(
                    this.pos,
                    this.tare,
                    this.get_unit()
                );
                return tare_str + " " + unit.name;
            }

            get_gross_weight_str_with_unit() {
                const unit = this.get_unit();
                const gross_weight_str = pos_tare_tools.format_tare(
                    this.pos,
                    this.get_gross_weight(),
                    this.get_unit()
                );
                return gross_weight_str + " " + unit.name;
            }
        };

    Registries.Model.extend(Orderline, overloadOrderline);
});
