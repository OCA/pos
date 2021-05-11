/*
Copyright (C) 2021-Today Akretion (https://akretion.com)
@author: Pierrick Brun <pierrick.brun@akretion.com>
 License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/


odoo.define('pos_customer_display.chrome', function (require) {
    "use strict";

    var chrome = require('point_of_sale.chrome');

    var core = require('web.core');
    var _t = core._t;

    chrome.ProxyStatusWidget.include({
        set_smart_status: function(status){
            this._super(status);
            if(status.status === 'connected'){
                var warning = this.$('.js_warning.oe_hidden').length == 0;
                var msg = this.$('.js_msg').html();
                if(this.pos.config.iface_customer_display){
                    var display = status.drivers.display ? status.drivers.display.status : false;
                    if( display != 'connected' && display != 'connecting'){
                        warning = true;
                        if (msg){
                            msg = _t('Display') + ' & ' + msg;
                        } else {
                            msg = _t('Display') + ' ' + _t('Offline');
                        }
                    }
                    this.set_status(warning ? 'warning' : 'connected', msg);
                }
            }
        },
    });
});
