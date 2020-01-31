/*
    Copyright (C) 2004-Today Apertoso NV (<http://www.apertoso.be>)
    Copyright (C) 2016-Today La Louve (<http://www.lalouve.net/>)

    @author: Jos DE GRAEVE (<Jos.DeGraeve@apertoso.be>)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)

    The licence is in the file __manifest__.py
*/


odoo.define('pos_customer_required.pos_customer_required', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');
    var gui = require('point_of_sale.gui');
    var core = require('web.core');
    var _t = core._t;

    screens.PaymentScreenWidget.include({
        validate_order: function(options) {
            if(this.pos.config.require_customer != 'no'
                    && !this.pos.get_order().get_client()){
                this.gui.show_popup('error',{
                    'title': _t('An anonymous order cannot be confirmed'),
                    'body':  _t('Please select a customer for this order.'),
                });
                return;
            }
            return this._super(options);
        }
    });

    /*
        Because of clientlist screen behaviour, it is not possible to simply
        use: set_default_screen('clientlist') + remove cancel button on
        customer screen.

        Instead of,
        - we overload the function : show_screen(screen_name,params,refresh),
        - and we replace the required screen by the 'clientlist' screen if the
        current PoS Order has no Customer.
    */

    var _show_screen_ = gui.Gui.prototype.show_screen;
    gui.Gui.prototype.show_screen = function(screen_name, params, refresh){
        if(this.pos.config.require_customer == 'order'
                && !this.pos.get_order().get_client()
                && screen_name != 'clientlist'){
            // We call first the original screen, to avoid to break the
            // 'previous screen' mecanism
            _show_screen_.call(this, screen_name, params, refresh);
            screen_name = 'clientlist';
        }
        _show_screen_.call(this, screen_name, params, refresh);
    };

});
