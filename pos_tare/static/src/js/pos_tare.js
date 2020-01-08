/*
Copyright (C) 2015-Today GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
 License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

"use strict";

openerp.pos_tare = function(instance){
    var module = instance.point_of_sale;
    var _t = instance.web._t;

    /*************************************************************************
        Extend : Widget 'PosWidget'
    */
    module.PosWidget = module.PosWidget.extend({
        build_widgets: function(){
            this._super();

            // Add a new screen 'TareScreenWidget'
            this.tare_screen = new module.TareScreenWidget(this,{});
            this.tare_screen.appendTo(this.$('.screens'));
            this.screen_selector.add_screen('tare', this.tare_screen);
        },
    });

    /*************************************************************************
        Extend : Widget 'ScaleScreenWidget'
    */
    module.ScaleScreenWidget = module.ScaleScreenWidget.extend({
        next_screen: 'tare',

        // Overwrite 'show' function to display TareScreenWidget
        show: function(){
            this.pos_widget.screen_selector.set_current_screen(this.next_screen,{product: this.get_product()});
        },
    });

    /*************************************************************************
        Define : New Widget 'TareScreenWidget'
    */
    module.TareScreenWidget = module.ScreenWidget.extend({
        template:'TareScreenWidget',
        next_screen: 'products',
        previous_screen: 'products',
        show_leftpane: false,

        show: function(){
            this._super();
            this.renderElement();
            var self = this;

            // Initialize values
            this.net_weight = 0;
            this.current_product = this.get_product();
            this.$('#product-name').html(this.get_product().display_name);
            this.$('#unit-price').html(this.format_currency(this.get_product().price));

            // Add a 'next' Button
            this.add_action_button({
                label: _t('Back'),
                icon: '/point_of_sale/static/src/img/icons/png48/go-previous.png',
                click: function(){  
                    self.pos_widget.screen_selector.set_current_screen(self.previous_screen);
                },
            });
            this.order_button = this.add_action_button({
                label: _t('Order'),
                icon: '/point_of_sale/static/src/img/icons/png48/go-next.png',
                click: function() { self.order_product_click(); },
            });

            // Initialize Display
            this.onChangeGrossWeightTareWeight();

            this.$('#gross-weight').keyup(function(event){
                self.onChangeGrossWeightTareWeight(event);
            });
            this.$('#tare-weight').keyup(function(event){
                self.onChangeGrossWeightTareWeight(event);
            });

            // Focus on Gross Weight
            this.$('#gross-weight').focus();

        },

        sanitize_value: function (input_name){
            var res = this.$(input_name)[0].value.replace(',', '.').trim();
            if (isNaN(res)){
                this.$(input_name).css("background-color", "#F66");
            }
            else{
                this.$(input_name).css("background-color", "#FFF");
            }
            return res;
        },

        onChangeGrossWeightTareWeight: function(event){
            var gross_weight = this.sanitize_value('#gross-weight');
            var tare_weight = this.sanitize_value('#tare-weight');
            var ok = false;

            if (!isNaN(gross_weight) && (gross_weight !== '') && (parseFloat(gross_weight) !== 0) && !isNaN(tare_weight)){
                this.net_weight = gross_weight - tare_weight;
                var price = this.get_product().price * this.net_weight;
                this.current_net_weight_text = this.net_weight.toFixed(3);
                this.current_total_price_text = this.format_currency(price);
                ok = true;
            }
            else{
                this.current_net_weight_text = '/';
                this.current_total_price_text = '/';
            }
            this.$('#net-weight').html(this.current_net_weight_text);
            this.$('#total-price').html(this.current_total_price_text);
            this.order_button.set_disabled(!ok);
        },

        get_product: function(){
            var ss = this.pos_widget.screen_selector;
            if(ss){
                return ss.get_current_screen_param('product');
            }else{
                return undefined;
            }
        },

        order_product_click: function(){
            this.pos.get('selectedOrder').addProduct(this.current_product,{ quantity:this.net_weight });
            this.pos_widget.screen_selector.set_current_screen(this.next_screen);
        },

    });
};





