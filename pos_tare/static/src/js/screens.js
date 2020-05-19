odoo.define('pos_tare.screens', function (require) {

    "use strict";
    var core = require('web.core');
    var screens = require('point_of_sale.screens');
    var utils = require('web.utils');

    var _t = core._t;
    var round_pr = utils.round_precision;

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
                this._super();
                if (this.pos.config.iface_tare_method !== 'manual') {
                    this.pos.barcode_reader.set_action_callback(
                        'tare',
                        _.bind(this.barcode_tare_action, this));
                }
            },
        });

    screens.ScaleScreenWidget.include({

        // /////////////////////////////
        // Overload Section
        // /////////////////////////////

        // Overload show function
        // add an handler on the
        show: function () {
            this._super();
            this.tare = 0.0;
            var self = this;
            this.$('#input_weight_tare').keyup(function (event) {
                self.onchange_tare(event);
            });
            this.$('#input_weight_tare').focus();
        },

        // Overload set_weight function
        // We assume that the argument is now the gross weight
        // we compute the net weight, depending on the tare and the gross weight
        // then we call super, with the net weight
        set_weight: function (gross_weight) {
            this.gross_weight = gross_weight;
            var net_weight = gross_weight - (this.tare || 0);
            this.$('#container_weight_gross').text(
                this.get_product_gross_weight_string());
            this._super(net_weight);
        },

        order_product: function () {
            // TODO Set a warning, if the value is incorrect;
            if (this.tare === undefined) {
                this.gui.show_popup('error', {
                    'title': _t('Incorrect Tare Value'),
                    'body': _t('Please set a numeric value' +
                        ' in the tare field, or let empty.'),
                });
            } else {
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
        get_product_gross_weight_string: function () {
            var product = this.get_product();
            var defaultstr = (this.gross_weight || 0).toFixed(3) + ' Kg';
            if (!product || !this.pos) {
                return defaultstr;
            }
            var unit_id = product.uom_id;
            if (!unit_id) {
                return defaultstr;
            }
            var unit = this.pos.units_by_id[unit_id[0]];
            var weight = round_pr(this.gross_weight || 0, unit.rounding);
            var weightstr = weight.toFixed(
                Math.ceil(Math.log(1.0/unit.rounding) / Math.log(10) ));
            weightstr += ' ' + unit.name;
            return weightstr;
        },

        onchange_tare: function () {
            this.tare = this.check_sanitize_value('#input_weight_tare');
            this.set_weight(this.gross_weight);
        },

        check_sanitize_value: function (input_name) {
            var res = this.$(input_name)[0].value.replace(',', '.').trim();
            if (isNaN(res)) {
                this.$(input_name).css("background-color", "#F66");
                return undefined;
            }
            this.$(input_name).css("background-color", "#FFF");
            return parseFloat(res, 10);
        },

    });

});
