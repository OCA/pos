odoo.define('pos_barcode_tare.screens', function (require) {

    "use strict";
    var core = require('web.core');
    var gui = require('point_of_sale.gui');
    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');
    var utils = require('web.utils');
    var field_utils = require('web.field_utils');

    var QWeb = core.qweb;
    var _t = core._t;
    var round_pr = utils.round_precision;
    var round_di = utils.round_decimals;
    var tare_barcode_type = "tare";

    // Define functions used to do unit operation.
    // Get unit search for unit based on unit name.
    var get_unit = function (pos, unit_name) {
        return pos.units.filter(
            function (u) {
                return u.name === unit_name;
            })[0];
    };

    // Convert mass using the reference UOM as pivot unit.
    var convert_mass = function (mass, from_unit, to_unit) {
        // There is no conversion from one category to another.
        if (from_unit.category_id[0] !== to_unit.category_id[0]) {
            throw new Error(_.str.sprintf(
                _t("We can not cast a weight in %s into %s."),
                from_unit.name, to_unit.name));
        }
        // No need to convert as weights are measured in same unit.
        if (from_unit.id === to_unit.id) {
            return mass;
        }
        // Converts "from_unit" to reference unit of measure.
        var result = mass;
        if (from_unit.uom_type === "bigger") {
            result /= from_unit.factor;
        } else {
            result *= from_unit.factor_inv;
        }
        // Converts reference unit of measure to "to_unit".
        if (to_unit.uom_type === "bigger") {
            result *= to_unit.factor;
        } else {
            result /= to_unit.factor_inv;
        }

        if (to_unit.rounding) {
            // Return the rounded result if needed.
            return round_pr(result || 0, to_unit.rounding);
        }

        return result || 0;
    };

    // Format the tare value.
    var format_tare = function (pos, qty, unit) {
        if (unit.rounding) {
            var q = round_pr(qty, unit.rounding);
            var decimals = pos.dp['Product Unit of Measure'];
            return field_utils.format.float(
                round_di(q, decimals),
                {type: 'float', digits: [69, decimals]});
        }
        return qty.toFixed(0);
    };

    // This configures read action for tare barcode. A tare barcode contains a
    // fake product ID and the weight to be subtracted from the product in the
    // latest order line.
    screens.ScreenWidget.include(
        {
            barcode_tare_action: function (code) {
                try {
                    var order = this.pos.get_order();
                    var selected_order_line = order.get_selected_orderline();
                    var tare_weight = code.value;
                    selected_order_line.set_tare(tare_weight);
                } catch (error) {
                    var title = _t("We can not apply this tare barcode.");
                    var popup = {title: title, body: error.message};
                    this.gui.show_popup('error', popup);
                }
            },
            // Setup the callback action for the "weight" barcodes.
            show: function () {
                
                console.log("okok");
                this._super();
                if (this.pos.config.iface_tare_method !== 'Manual') {
                
                    console.log("okokokok");
                    this.pos.barcode_reader.set_action_callback(
                        'tare',
                        _.bind(this.barcode_tare_action, this));
                    }
            },
        });

    // This create a new button on top of action widget. This button links to
    // the barcode label printing screen defined below.
    var TareScreenButton = screens.ActionButtonWidget.extend({
        template: 'TareScreenButton',

        button_click: function () {
            this.gui.show_screen('tare');
        },
    });

    screens.ScaleScreenWidget.include({

        // /////////////////////////////
        // Overload Section
        // /////////////////////////////

        // Overload show function
        // add an handler on the 
        show: function(){
            this._super();
            this.tare = 0.0;
            var self = this;
            this.$('#input_weight_tare').keyup(function(event){
                self.onchange_tare(event);
            });
            this.$('#input_weight_tare').focus()
        },

        // Overload set_weight function
        // We assume that the argument is now the gross weight
        // we compute the net weight, depending on the tare and the gross weight
        // then we call super, with the net weight
        set_weight: function(gross_weight){
            this.gross_weight = gross_weight;
            var net_weight = gross_weight - (this.tare || 0);
            this.$('#container_weight_gross').text(this.get_product_gross_weight_string());
            this._super(net_weight);
        },

        order_product: function(){
            // TODO Set a warning, if the value is incorrect;
            if (this.tare === undefined) {
                this.gui.show_popup('error',{
                    'title': _t('Incorrect Tare Value'),
                    'body': _t('Please set a numeric value in the tare field, or let empty.'),
                });
            }
            else {
                this._super();
                if (this.tare > 0.0) {
                    var order = this.pos.get_order();
                    var orderline = order.get_last_orderline();
                    orderline.set_tare(this.tare);
                }
            }
        },

        // /////////////////////////////
        // Custom Section
        // /////////////////////////////
        get_product_gross_weight_string: function(){
            var product = this.get_product();
            var defaultstr = (this.gross_weight || 0).toFixed(3) + ' Kg';
            if(!product || !this.pos){
                return defaultstr;
            }
            var unit_id = product.uom_id;
            if(!unit_id){
                return defaultstr;
            }
            var unit = this.pos.units_by_id[unit_id[0]];
            var weight = round_pr(this.gross_weight || 0, unit.rounding);
            var weightstr = weight.toFixed(Math.ceil(Math.log(1.0/unit.rounding) / Math.log(10) ));
            weightstr += ' ' + unit.name;
            return weightstr;
        },

        onchange_tare: function(event){
            this.tare = this.check_sanitize_value('#input_weight_tare');;
            this.set_weight(this.gross_weight);
        },

        check_sanitize_value: function (input_name){
            var res = this.$(input_name)[0].value.replace(',', '.').trim();
            if (isNaN(res)){
                this.$(input_name).css("background-color", "#F66");
                return undefined;
            }
            else{
                this.$(input_name).css("background-color", "#FFF");
                return parseFloat(res, 10);
            }
        },

    });
    
    // Update Orderline model
    var _super_ = models.Orderline.prototype;
    var OrderLineWithTare = models.Orderline.extend({
        initialize: function (session, attributes) {
            this.tareQuantity = 0;
            this.tareQuantityStr = '0';
            return _super_.initialize.call(this, session, attributes);
        },
        init_from_JSON: function (json) {
            _super_.init_from_JSON.call(this, json);
            this.tareQuantity = json.tareQuantity ||0;
            this.tareQuantityStr = json.tareQuantityStr ||'0';
        },
        set_tare: function (quantity) {
            this.order.assert_editable();

            // Prevent to apply multiple times a tare to the same product.
            if (this.get_tare() > 0) {
                throw new RangeError(_.str.sprintf(
                    _t("The tare (%s) is already set for the " +
                    "product \"%s\". We can not re-apply a tare to this " +
                    "product."),
                    this.get_tare_str_with_unit(), this.product.display_name));
            }

            // We convert the tare that is always measured in kilogrammes into
            // the unit of measure for this order line.
            var kg = get_unit(this.pos, "kg");
            var tare = parseFloat(quantity) || 0;
            var unit = this.get_unit();
            var tare_in_product_uom = convert_mass(tare, kg, unit);
            var tare_in_product_uom_string = format_tare(this.pos,
                tare_in_product_uom, unit);
            var net_quantity = this.get_quantity() - tare_in_product_uom;
            // This method fails when the net weight is negative.
            if (net_quantity <= 0) {
                throw new RangeError(_.str.sprintf(
                    _t("The tare weight is %s %s, it's greater or equal to " +
                    "the product weight %s. We can not apply this tare."),
                    tare_in_product_uom_string, unit.name,
                    this.get_quantity_str_with_unit()));
            }
            // Update tare value.
            this.tareQuantity = tare_in_product_uom;
            this.tareQuantityStr = tare_in_product_uom_string;
            // Update the quantity with the new weight net of tare quantity.
            this.set_quantity(net_quantity);
            this.trigger('change', this);
        },
        get_tare: function () {
            return this.tareQuantity;
        },
        get_tare_str: function () {
            return this.tareQuantityStr;
        },
        get_tare_str_with_unit: function () {
            var unit = this.get_unit();
            return this.tareQuantityStr + ' ' + unit.name;
        },
        export_as_JSON: function () {
            var json = _super_.export_as_JSON.call(this);
            json.tareQuantity = this.get_tare();
            json.tareQuantityStr = this.get_tare_str();
            return json;
        },
        clone: function () {
            var orderline = _super_.clone.call(this);
            orderline.tareQuantity = this.tareQuantity;
            orderline.tareQuantityStr = this.tareQuantityStr;
            return orderline;
        },
        export_for_printing: function () {
            var result = _super_.export_for_printing.call(this);
            result.tare_quantity = this.get_tare();
            return result;
        },
    });

    models.Orderline = OrderLineWithTare;

    return {OrderLineWithTare: OrderLineWithTare,
        get_unit: get_unit};
});
