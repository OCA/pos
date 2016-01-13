/*
    Copyright (C) 2004-Today Apertoso NV (<http://www.apertoso.be>)
    Copyright (C) 2016-Today La Louve (<http://www.lalouve.net/>)

    @author: Jos DE GRAEVE (<Jos.DeGraeve@apertoso.be>)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)

    The licence is in the file __openerp__.py
*/


odoo.define('pos_require_customer.pos_require_customer', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');
    var core = require('web.core');
    var _t = core._t;

    screens.PaymentScreenWidget.include({
        validate_order: function(options) {
            var currentOrder = this.pos.get('selectedOrder');
            
            if( this.pos.config.require_customer != 'no' && !currentOrder.get_client()){
                this.gui.show_popup('error',{
                    'title': _t('An anonymous order cannot be confirmed'),
                    'body':  _t('Please select a customer for this order.'),
                });
                return;
            }
            return this._super(options);
        }
    });

});
