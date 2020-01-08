/*
Copyright (C) 2015-Today GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
 License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/


odoo.define('pos_tare.screens', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');
    var utils = require('web.utils');
    var round_pr = utils.round_precision;


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

});
