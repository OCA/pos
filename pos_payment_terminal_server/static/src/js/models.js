/*
    Copyright 2019 ACSONE SA/NV
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/
odoo.define('pos_payment_terminal_server.models', function (require) {
"use strict";
var models = require('point_of_sale.models');
var devices = require('pos_payment_terminal_server.devices');

var _super_posmodel = models.PosModel.prototype;

models.PosModel = models.PosModel.extend({
    initialize: function(session, attributes) {
        var self = this;
        _super_posmodel.initialize.call(this, session, attributes);
        this.terminal_server = new devices.ProxyTerminalDevice(this);
    },
    after_load_server_data: function(){
        self = this;
        var done = _super_posmodel.after_load_server_data.call(this);
        if(this.config.iface_payment_terminal_server){
            return this.connect_to_terminal_server();
        }
        return done;
    },
    connect_to_terminal_server: function(){
        var self = this;
        var done = new $.Deferred();
        this.terminal_server.autoconnect({
                force_ip: self.config.iface_payment_terminal_server || undefined,
                progress: function(prog){
                    self.chrome.loading_progress(prog);
                },
            }).always(function(){
                done.resolve();
            });
        return done;
    },
});


});

