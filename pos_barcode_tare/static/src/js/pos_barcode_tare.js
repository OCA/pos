odoo.define('barcode_tare', function (require) {
    "use strict";
    var screens = require('point_of_sale.screens');
    var gui = require('point_of_sale.gui');
    var core = require('web.core');
    var _t = core._t;

    screens.ScreenWidget.include(
        {
            barcode_weight_action: function (code) {
                var self = this;
                var order = this.pos.get_order();
                var last_order_line = order.get_last_orderline();
                var total_weight = last_order_line.get_quantity();
                var tare = code.value;
                var paid_weight = total_weight - tare;

                if (paid_weight <= 0) {
                    self.gui.show_popup('confirm',
                        {'title': _t('Negative weight'),
                            'body':  _t('The calculated weight is negative. ' +
                        'Did you scan the correct tare label?'),
                            confirm: function () {
                                last_order_line.set_quantity(paid_weight);
                            }});
                } else {
                    last_order_line.set_quantity(paid_weight);
                }
            },

            show: function () {
                var self = this;
                this._super();
                this.pos.barcode_reader.set_action_callback(
                    'weight',
                    _.bind(self.barcode_weight_action, self));
            },
        });
});

odoo.define('tare-screen-button.button', function (require) {
    "use strict";
    var core = require('web.core');
    var screens = require('point_of_sale.screens');
    var gui = require('point_of_sale.gui');

    var TareScreenButton = screens.ActionButtonWidget.extend({
        template: 'TareScreenButton',

        button_click: function () {
            var self = this;
            this.gui.show_screen('tare');
        },
    });

    screens.define_action_button({
        'name': 'tareScreenButton',
        'widget': TareScreenButton,
    });
});

odoo.define('tare-screen.screen', function (require) {
    "use strict";
    var chrome = require('point_of_sale.chrome');
    var core = require('web.core');
    var devices = require('point_of_sale.devices');
    var gui = require('point_of_sale.gui');
    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');
    var QWeb = core.qweb;

    var TareScreenWidget = screens.ScreenWidget.extend({
        template: 'TareScreenWidget',
        next_screen: 'products',
        previous_screen: 'products',
        default_tare_value_kg: 0.0,

        show: function () {
            this._super();
            var self = this;
            var queue = this.pos.proxy_queue;

            queue.schedule(function () {
                return self.pos.proxy.scale_read().then(function (weight) {
                    self.set_weight(weight.weight);
                });
            }, {duration:150, repeat: true});

            this.render_receipt();
            this.lock_screen(true);
        },
        set_weight: function (weight) {
            if (weight > 0) {
                this.weight = weight;
                this.render_receipt();
                this.lock_screen(false);
            }
        },
        get_weight: function () {
            if (typeof this.weight === 'undefined') {
                return this.default_tare_value_kg;
            }
            return this.weight;
        },
        ean13_checksum: function (s) {
            var result = 0;
            for (var counter = s.length-1; counter >=0; counter--) {
                var counterCheckSum = counter % 2;
                counterCheckSum *= 2;
                counterCheckSum += 1;
                result += parseInt(s.charAt(counter), 10) * counterCheckSum;
            }
            var checksum = 10;
            checksum -= result % 10;
            return checksum % 10;
        },
        barcode_data: function (weight) {
            var padding_size = 5;
            var default_weight_prefix_id = "21";
            var void_product_id = '0'.repeat(padding_size);
            var weight_in_gram = weight * 10e2;
            var weight_with_padding = '0'.repeat(padding_size) + weight_in_gram;
            var padded_weight = weight_with_padding.substr(
                weight_with_padding.length - padding_size);
            var barcode_data = default_weight_prefix_id.concat(void_product_id,
                padded_weight);
            var checksum = this.ean13_checksum(barcode_data);
            var barcode = barcode_data.concat(checksum);

            console.log(barcode);
            return barcode;
        },
        get_barcode_data: function () {
            return this.barcode_data(this.get_weight());
        },
        should_auto_print: function () {
            return this.pos.config.iface_print_auto &&
            !this.pos.get_order()._printed;
        },
        should_close_immediately: function () {
            return this.pos.config.iface_print_via_proxy &&
            this.pos.config.iface_print_skip_screen;
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
            var self = this;

            // See comment in print function of ReceiptScreenWidget

            this.lock_screen(true);

            setTimeout(function () {
                self.lock_screen(false);
            }, 1000);

            this.print_web();
            this.click_back();
        },
        click_back: function () {
            this.close();
            this.gui.show_screen(this.previous_screen);
        },
        renderElement: function () {
            var self = this;
            this._super();
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
