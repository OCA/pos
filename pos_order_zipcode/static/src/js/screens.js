/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Pierre Verkest <pierreverkest84@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 */

odoo.define('pos_order_zipcode.screens', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');
    var gui = require('point_of_sale.gui');
    screens.PaymentScreenWidget.include({

        init: function(parent, options) {
            var self = this;
            this._super(parent, options);
        },
        order_is_valid: function(force_validation) {
            var order = this.pos.get_order();
            if (this.pos.config.pos_order_zipcode_zip_required && !order.get_zipcode()) {
                // order is either undefined / null / or empty string: ""
                this.click_set_zipcode();
                return false;
            }
            return this._super.apply(this, arguments);
        },
        click_set_zipcode: function(){
            this.gui.show_screen('zipcodeinput');
        },
        order_changes: function(){
            this._super.apply(this, arguments);
            self = this;
            this.pos.get_order().bind('change:zipcode', function() {
                self.zipcode_changed();
            }, this);
            // this.zipcode_changed();
        },
        renderElement: function() {
            var self = this;
            this._super.apply(this, arguments);
            this.$('.js_set_order_zipcode').click(function(){
                self.click_set_zipcode();
            });
        },
        zipcode_changed: function() {
            var order_zipcode = this.pos.get_order().get_zipcode();
            if( !this.pos.config.pos_order_zipcode_zip_required || order_zipcode ){
                this.$('div.button.js_set_order_zipcode')[0].classList.remove('highlight');
            } else {
                this.$('div.button.js_set_order_zipcode')[0].classList.add('highlight');
            }
            this.$('.js_zipcode').text( order_zipcode ? order_zipcode : _t('ZIP Code') ); 
        },
    });

    var ZipCodeScreenWidget = screens.ScreenWidget.extend({
        template: 'ZipCodeScreenWidget',

        init: function(parent, options){
            this._super(parent, options);
        },

        auto_back: true,

        show: function(){
            var self = this;
            this._super();

            this.renderElement();
            this.$('.back').click(function(){
                self.gui.back();
            });

            this.$('.next').click(function(){
                self.save_changes();
                self.gui.back();
            });

            if(this.pos.config.iface_vkeyboard && this.chrome.widget.keyboard){
                this.chrome.widget.keyboard.connect(this.$('.zipcode input'));
            }

            this.$('.zipcode .clear-zipcode').click(function(){
                self.clear_zipcode();
            });
            
            const order = this.pos.get_order();
            this.$('.zipcode input').val(order.get_zipcode());
            this.$('.zipcode input').select();
            this.$('.zipcode input').on('keyup', function(event){
                if(event.keyCode === 13){  // Save on enter
                    self.save_changes();
                    self.gui.back();
                } else if (event.keyCode === 27) { // Cancel with esc
                    self.gui.back();
                }
            });
        },
        save_changes: function(){
            const order = this.pos.get_order();
            order.set_zipcode(this.$('.zipcode input').val())
        },
        clear_zipcode: function(){
            this.$('.zipcode input').val("");
        },
        close: function(){
            this._super();
            if (this.pos.config.iface_vkeyboard && this.chrome.widget.keyboard) {
                this.chrome.widget.keyboard.hide();
            }
        },
    });
    gui.define_screen({name:'zipcodeinput', widget: ZipCodeScreenWidget});

});
