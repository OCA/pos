odoo.define("pos_tare.models", function (require) {
    "use strict";
    var models = require("point_of_sale.models");
    models.load_fields("product.product", ["tare_weight"]);
    var pos_tare_tools = require("pos_tare.tools");
    var _super_ = models.Orderline.prototype;
    var _superOrder_ = models.Order.prototype;

    var OrderWithTare = models.Order.extend({
        add_product: function (product, options) {
            var res = _superOrder_.add_product.call(this, product, options);
            if (options.tare !== undefined) {
                this.get_last_orderline().set_tare(options.tare);
            }
            return res;
        },
    });

    var OrderLineWithTare = models.Orderline.extend({
        // /////////////////////////////
        // Overload Section
        // /////////////////////////////

        initialize: function (session, attributes) {
            this.tare = 0;
            return _super_.initialize.call(this, session, attributes);
        },

        init_from_JSON: function (json) {
            _super_.init_from_JSON.call(this, json);
            this.tare = json.tare || 0;
        },

        clone: function () {
            var orderline = _super_.clone.call(this);
            orderline.tare = this.tare;
            return orderline;
        },

        export_as_JSON: function () {
            var json = _super_.export_as_JSON.call(this);
            json.tare = this.get_tare();
            return json;
        },

        export_for_printing: function () {
            var result = _super_.export_for_printing.call(this);
            result.tare_quantity = this.get_tare();
            result.gross_quantity = this.get_gross_weight();
            return result;
        },

        // /////////////////////////////
        // Custom Section
        // /////////////////////////////

        set_tare: function (quantity, update_net_weight) {
            this.order.assert_editable();

            // Prevent to apply multiple times a tare to the same product.

            if (this.get_tare() > 0) {
                // This is valid because the tare is stored using product UOM.
                this.set_quantity(this.get_quantity() + this.get_tare());
                this.reset_tare();
            }

            // We convert the tare that is always measured in the same UoM into
            // the unit of measure for this order line.
            var tare_uom = this.pos.config.iface_tare_uom_id[0];
            var tare_unit = this.pos.units_by_id[tare_uom];
            var tare = parseFloat(quantity) || 0;
            var line_unit = this.get_unit();
            var tare_in_product_uom = pos_tare_tools.convert_mass(
                tare,
                tare_unit,
                line_unit
            );
            if (update_net_weight) {
                var net_quantity = this.get_quantity() - tare_in_product_uom;
                // Update the quantity with the new weight net of tare quantity.
                this.set_quantity(net_quantity);
            }
            // Update tare value.
            this.tare = tare_in_product_uom;
            this.trigger("change", this);
        },

        reset_tare: function () {
            this.tare = 0;
        },

        get_tare: function () {
            return this.tare;
        },

        get_gross_weight: function () {
            return this.get_tare() + this.get_quantity();
        },

        get_tare_str_with_unit: function () {
            var unit = this.get_unit();
            var tare_str = pos_tare_tools.format_tare(
                this.pos,
                this.tare,
                this.get_unit()
            );
            return tare_str + " " + unit.name;
        },

        get_gross_weight_str_with_unit: function () {
            var unit = this.get_unit();
            var gross_weight_str = pos_tare_tools.format_tare(
                this.pos,
                this.get_gross_weight(),
                this.get_unit()
            );
            return gross_weight_str + " " + unit.name;
        },
    });

    models.Orderline = OrderLineWithTare;
    models.Order = OrderWithTare;
});
