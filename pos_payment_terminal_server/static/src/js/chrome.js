/*
    Copyright 2019 ACSONE SA/NV
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/
odoo.define('pos_payment_terminal_server.chrome', function (require) {
"use strict";

var chrome = require('point_of_sale.chrome');
var core = require('web.core');

var _t = core._t;

var ProxyMultiStatusWidget = chrome.ProxyStatusWidget.extend({
    template: 'ProxyMultiStatusWidget',
    set_terminal_status: function(status){
        if(status.status === 'connected'){
            var warning = false;
            var msg = '';
            if(this.pos.config.use_payment_terminal_server){
                for (var driver in status.drivers){
                    if (status.drivers[driver].is_terminal && status.drivers[driver].status != 'connected'){
                        warning = true;
                        msg += _t('Payment server');
                    }
                }
            }
            msg = msg ? msg + ' ' + _t('Offline') : msg;
            this.set_status(warning ? 'warning' : 'connected', msg);
        }else{
            this.set_status(status.status,'');
        }
    },

    start: function(){
        var self = this;
        this.set_terminal_status(this.pos.terminal_server.get('status'));
        this.pos.terminal_server.on('change:status',this,function(eh,status){
            self.set_terminal_status(status.newValue);
        });
        this.$el.click(function(){
            self.pos.connect_to_terminal_server();
        });
    },

});

var Chrome = chrome.Chrome.include({
    init: function() {
        var self = this;
        this._super(arguments[0],{});
        this.widgets.push({
            'name':   'proxy_multi_status',
            'widget': ProxyMultiStatusWidget,
            'append':  '.pos-rightheader',
            'condition': function(){ return this.pos.config.use_payment_terminal_server; },
        });
    }

});

return {
    ProxyMultiStatusWidget: ProxyMultiStatusWidget,
    Chrome: Chrome,
    }

});
