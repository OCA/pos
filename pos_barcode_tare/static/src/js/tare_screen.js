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

        show: function(){
            this._super();
            var self = this;
            var queue = this.pos.proxy_queue;

            queue.schedule(function(){
                return self.pos.proxy.scale_read().then(function(weight){
                    self.set_weight(weight.weight);
                });
            },{duration:150, repeat: true});

            this.render_receipt();
            this.lock_screen(true);
        },
        set_weight: function(weight){
            if (weight > 0){
                this.weight = weight;
                this.render_receipt();
                this.lock_screen(false);
            }
        },
        get_weight: function(){
            if (typeof this.weight === 'undefined') {
                return this.default_tare_value_kg;
            }
            return this.weight;
        },
        ean13_checksum: function(s){
            var result = 0;
            for (let counter = s.length-1; counter >=0; counter--){
                result = result + parseInt(s.charAt(counter)) * (1+(2*(counter % 2)));
            }
            return (10 - (result % 10)) % 10;
        },
        barcode_data: function(weight, weight_prefix_id=21){
            var padding_size = 5;
            var void_product_id = '0'.repeat(padding_size);
            var weight_in_gram =  weight * 10e2;
            var weight_with_padding = '0'.repeat(padding_size) + weight_in_gram;
            var padded_weight = weight_with_padding.substr(weight_with_padding.length - padding_size);
            var barcode_data = `${weight_prefix_id}${void_product_id}${padded_weight}`;
            var checksum = this.ean13_checksum(barcode_data);
            console.log(`${barcode_data}${checksum}`);
            return `${barcode_data}${checksum}`;
        },
        get_barcode_data: function(){
            return this.barcode_data(this.get_weight());
        },
        should_auto_print: function() {
            return this.pos.config.iface_print_auto && !this.pos.get_order()._printed;
        },
        should_close_immediately: function() {
            return this.pos.config.iface_print_via_proxy && this.pos.config.iface_print_skip_screen;
        },
        lock_screen: function(locked) {
            this._locked = locked;
            if (locked) {
                this.$('.print-label').addClass('disabled');
            } else {
                this.$('.print-label').removeClass('disabled');
            }
        },
        print_web: function() {
            window.print();
            this.pos.get_order()._printed = true;
        },
        print: function() {
            var self = this;

            // The problem is that in chrome the print() is asynchronous and doesn't
            // execute until all rpc are finished. So it conflicts with the rpc used
            // to send the orders to the backend, and the user is able to go to the next
            // screen before the printing dialog is opened. The problem is that what's
            // printed is whatever is in the page when the dialog is opened and not when it's called,
            // and so you end up printing the product list instead of the receipt...
            //
            // Fixing this would need a re-architecturing
            // of the code to postpone sending of orders after printing.
            //
            // But since the print dialog also blocks the other asynchronous calls, the
            // button enabling in the setTimeout() is blocked until the printing dialog is
            // closed. But the timeout has to be big enough or else it doesn't work
            // 1 seconds is the same as the default timeout for sending orders and so the dialog
            // should have appeared before the timeout... so yeah that's not ultra reliable.

            this.lock_screen(true);

            setTimeout(function(){
                self.lock_screen(false);
            }, 1000);

            this.print_web();
            this.click_back();
        },
        click_back: function() {
            this.close()
            this.gui.show_screen(this.previous_screen);
        },
        renderElement: function() {
            var self = this;
            this._super();
            this.$('.back').click(function(){
                self.click_back();
            });
            this.$('.print-label').click(function(){
                if (!self._locked) {
                    self.print();
                }
            });
        },
        render_receipt: function() {
            this.$('.pos-tare-label-container').html(QWeb.render('PosTareLabel',{widget:this}));
        },
        close: function(){
            this._super();
            delete this.weight;
            this.pos.proxy_queue.clear();
        },
    });

    gui.define_screen({name:'tare', widget: TareScreenWidget});

   });