/*
    Copyright 2019 ACSONE SA/NV
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/
odoo.define('pos_payment_terminal_server.devices', function (require) {
"use strict";
var devices = require('point_of_sale.devices');
var core = require('web.core')

var _super_proxydevice = devices.ProxyDevice.prototype;

var ProxyTerminalDevice  = devices.ProxyDevice.extend({
    update_transaction_data: function(line, data){
        this._super(line, data)
        data.terminal_id = this.pos.config.iface_payment_terminal_id
    },
    set_terminal_status: function(terminal_id){
        // Will get status from proxy for this terminal id
        var self = this;
        self.connection.rpc('/hw_proxy/status_json',{'terminal_id': terminal_id},{timeout:2500})
                .then(function(driver_status){
                    for (var driver in driver_status){
                        if (driver_status[driver].is_terminal && driver_status[driver].status === 'connected'){
                            self.set_connection_status('connected',driver_status);
                            break;
                        }
                    }
                },function(){
                    if(self.get('status').status !== 'connecting'){
                        self.set_connection_status('disconnected');
                    }
                }).always(function(){
                    setTimeout(self.set_terminal_status.bind(self, terminal_id),5000);
                });
    },
    // starts a loop that updates the connection status
    keepalive: function(){
        var self = this;
        if(!this.keptalive){
            if (self.pos.config.use_payment_terminal_server){
                this.keptalive = true;
                this.set_terminal_status(self.pos.config.iface_payment_terminal_id);
            }
        }
    },
});

return {
    ProxyTerminalDevice: ProxyTerminalDevice,
}

});
