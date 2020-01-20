odoo.define('barcode_tare',function(require) {
	"use strict";
	var screens = require('point_of_sale.screens');
    var gui = require('point_of_sale.gui');
    var core = require('web.core');
    var _t = core._t;

	screens.ScreenWidget.include(
	{
		barcode_weight_action: function(code){
	        var self = this;
            var order = this.pos.get_order();
            var last_order_line = order.get_last_orderline();
            var total_weight = last_order_line.get_quantity();
            var tare = code.value;
            var paid_weight = total_weight - tare;

            if (paid_weight <= 0) {
                this.gui.show_popup('confirm', {
                    'title': _t('Poids négatif'),
                    'body':  _t('Le poids à payer est négatif. Avez-vous scanné le bon code bare ?'),
                    confirm: function(){
                        last_order_line.set_quantity(paid_weight)
                }});
            } else {
                last_order_line.set_quantity(paid_weight)
            }
        },

        show: function(){
            var self = this;
            this._super()
            this.pos.barcode_reader.set_action_callback('weight',  _.bind(self.barcode_weight_action, self))
        },
	});
});
