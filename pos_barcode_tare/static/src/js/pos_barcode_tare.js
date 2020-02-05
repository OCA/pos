odoo.define('pos_barcode_tare.screens', function (require) {

    "use strict";
    var chrome = require('point_of_sale.chrome');
    var core = require('web.core');
    var devices = require('point_of_sale.devices');
    var gui = require('point_of_sale.gui');
    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');
    var utils = require('web.utils');

    var QWeb = core.qweb;
    var _t = core._t;
    var round_pr = utils.round_precision;
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
            return;
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
        // Round the result.
        return round_pr(result || 0, to_unit.rounding);
    };

    // This configures read action for tare barcode. A tare barcode contains a
    // fake product ID and the weight to be subtracted from the product in the
    // latest order line.
    screens.ScreenWidget.include(
        {
            barcode_tare_action: function (code) {
                var order = this.pos.get_order();
                // Computes the paid weight
                var last_order_line = order.get_last_orderline();
                var total_weight = last_order_line.get_quantity();
                var tare = code.value;
                var product_unit = last_order_line.get_unit();
                // Try to convert tare in KG into product UOM.
                var kg_unit = get_unit(this.pos, "kg");
                var tare_in_product_uom =
                    convert_mass(tare, kg_unit, product_unit);
                // Alert when mass conversion failed.
                if (typeof tare_in_product_uom === 'undefined') {
                    this.gui.show_popup('error',
                        {'title': _t('Mismatch in units of measure'),
                            'body':  _t('You scanned a tare barcode. ' +
                        'The tare is applied to the last product in order. '+
                        'We can not apply the tare to this product.')});
                    return;
                }
                // Computes the paid (net) weight.
                var paid_weight = total_weight - tare_in_product_uom;
                // Throws a warning popup if the price is negative.
                if (paid_weight <= 0) {
                    this.gui.show_popup('confirm',
                        {'title': _t('Negative weight'),
                            'body':  _t('The calculated weight is negative. ' +
                        'Did you scan the correct tare label?'),
                            confirm: function () {
                                // Operator can choose to ignore the warning.
                                last_order_line.set_quantity(paid_weight);
                            }});
                } else {
                    // Updates the prices.
                    last_order_line.set_quantity(paid_weight);
                }
            },
            // Setup the callback action for the "weight" barcodes.
            show: function () {
                this._super();
                this.pos.barcode_reader.set_action_callback(
                    'tare',
                    _.bind(this.barcode_tare_action, this));
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

    screens.define_action_button({
        'name': 'tareScreenButton',
        'widget': TareScreenButton,
    });

    // This is a new screen that reads weight from the electronic scale and
    // create a barcode label encoding the weight. The screen shows a preview
    // of the label. The user is expected to check if the preview matches what's
    // measured on the scale. The barcode image is generated by the report
    // module.
    var TareScreenWidget = screens.ScreenWidget.extend({
        template: 'TareScreenWidget',
        next_screen: 'products',
        previous_screen: 'products',
        default_tare_value: 0.0,
        weight_barcode_prefix: null,

        show: function () {
            this._super();
            // Fetch the unit of measure used to save the tare
            this.kg_unit = get_unit(this.pos, "kg");
            // Fetch the barcode prefix from POS barcode parser rules.
            this.weight_barcode_prefix = this.get_barcode_prefix();
            // Setup the proxy
            var queue = this.pos.proxy_queue;
            // The pooling of the scale starts here.
            var self = this;
            queue.schedule(function () {
                return self.pos.proxy.scale_read().then(function (weight) {
                    self.set_weight(weight);
                });
            }, {duration:150, repeat: true});
            // Shows a barcode whose weight might be zero, but this is preferred
            // for UI/UX reasons.
            this.render_receipt();
            this.lock_screen(true);
        },
        get_barcode_prefix: function () {
            var barcode_pattern = this.get_barcode_pattern();
            return barcode_pattern.substr(0, 2);
        },
        get_barcode_pattern: function () {
            var rules = this.get_barcode_rules();
            var rule = rules.filter(
                function (r) {
                    // We select the first (smallest sequence ID) barcode rule
                    // with the expected type.
                    return r.type === tare_barcode_type;
                })[0];
            return rule.pattern;
        },
        get_barcode_rules: function () {
            return this.pos.barcode_reader.barcode_parser.nomenclature.rules;
        },
        set_weight: function (scale_measure) {
            var weight = scale_measure.weight;
            var unit = get_unit(this.pos, scale_measure.unit);
            if (weight > 0) {
                this.weight_in_kg = convert_mass(weight, unit, this.kg_unit);
                this.render_receipt();
                this.lock_screen(false);
            }
        },
        get_weight: function () {
            if (typeof this.weight_in_kg === 'undefined') {
                return this.default_tare_value;
            }
            return this.weight_in_kg;
        },
        barcode_data: function (weight) {
            // We use EAN13 barcode, it looks like 07 00000 12345 x. First there
            // is the prefix, here 07, that is used to decide which type of
            // barcode we're dealing with. A weight barcode has then two groups
            // of five digits. The first group encodes the product id. Here the
            // product id is 00000. The second group encodes the weight in
            // grams. Here the weight is 12.345kg. The last digit of the barcode
            // is a checksum, here symbolized by x.
            var padding_size = 5;
            var void_product_id = '0'.repeat(padding_size);
            var weight_in_gram = weight * 10e2;
            // Weight has to be padded with zeros.
            var weight_with_padding = '0'.repeat(padding_size) + weight_in_gram;
            var padded_weight = weight_with_padding.substr(
                weight_with_padding.length - padding_size);
            // Builds the barcode using a placeholder checksum.
            var barcode = this.weight_barcode_prefix
                .concat(void_product_id, padded_weight)
                .concat(0);
            // Compute checksum
            var barcode_parser = this.pos.barcode_reader.barcode_parser;
            var checksum = barcode_parser.ean_checksum(barcode);
            // Replace checksum placeholder by the actual checksum.
            return barcode.substr(0, 12).concat(checksum);
        },
        get_barcode_data: function () {
            return this.barcode_data(this.get_weight());
        },
        lock_screen: function (locked) {
            this._locked = locked;
            if (locked) {
                this.$('.print-label').addClass('disabled');
            } else {
                this.$('.print-label').removeClass('disabled');
            }
        },
        print_web: function () {
            window.print();
            this.pos.get_order()._printed = true;
        },
        print: function () {
            // See comment in print function of ReceiptScreenWidget
            this.lock_screen(true);

            setTimeout(function () {
                this.lock_screen(false);
            }, 1000);

            this.print_web();
            this.click_back();
        },
        click_back: function () {
            this.close();
            this.gui.show_screen(this.previous_screen);
        },
        renderElement: function () {
            this._super();
            var self = this;
            this.$('.back').click(function () {
                self.click_back();
            });
            this.$('.print-label').click(function () {
                if (!self._locked) {
                    self.print();
                }
            });
        },
        render_receipt: function () {
            this.$('.pos-tare-label-container').html(
                QWeb.render('PosTareLabel', {widget:this}));
        },
        close: function () {
            this._super();
            delete this.weight;
            this.pos.proxy_queue.clear();
        },
    });

    gui.define_screen({name:'tare', widget: TareScreenWidget});

});
