/*
    POS Automatic Cashdrawer module for Odoo
    Copyright (C) 2016 Aurélien DUMAINE
    Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
    @author: Aurélien DUMAINE
    The licence is in the file __manifest__.py
*/

odoo.define('pos_automatic_cashdrawer.devices', function (require) {
    "use strict";

    var devices = require('point_of_sale.devices');
    var core = require('web.core');
    var framework = require('web.framework');

    var _t = core._t;

    devices.ProxyDevice.include({

        /*
            Overload keepalive.
            This function is called right after the PosBox is connected and the handshake is made.
            Normally, it starts a keepalive timer that request /hw_proxy/status_json
            But we're also sending the Cashdrawer connection config here.
        */
        keepalive: function () {
            this._super.apply(this, arguments);
            if (this.pos.config.iface_automatic_cashdrawer) {
                this.message('cashlogy/connect', {
                    'config': {
                        'host': this.pos.config.iface_automatic_cashdrawer_ip_address,
                        'port': this.pos.config.iface_automatic_cashdrawer_tcp_port
                    }
                });
            }
        },

        /*
            Starts a sale transaction using the backoffice.
            It will display the backoffice window so that the cashier can
            confirm the amount.
            It will return the collected amount.

            options.operation_number    default to 00000

            Possible exceptions:
                CancelledOperation
                Busy

            @returns    {amount: 0.00, amount_in: 0.00, amount_out: 0.00}
        */
        automatic_cashdrawer_display_transaction_start: function (amount, options) {
            options = options || {};
            var self = this;
            var done = this.message('cashlogy/display_transaction_start', {
                'amount': amount,
                'options': options,
            });
            done.fail(function (error) {
                var message = error ? error.data.message : _t('Cashdrawer not connected');
                var body = error ? error.data.debug : _t('Make sure Cashdrawer connected with IOT Box');
                self.pos.gui.show_popup('error-traceback', {
                    'title': _t('Cashdrawer Error: ') + message,
                    'body': body
                });
            });
            framework.blockUI();
            done.always(function () { 
                framework.unblockUI(); 
            });
            return done;
        },

        /*
            Display Close Till

            @returns    {total_before: 0.00, added: 0.00, dispensed: 0.00, total: 0.00}
        */
        automatic_cashdrawer_display_close_till: function () {
            var self = this;
            var done = this.message('cashlogy/display_close_till');
            done.fail(function (error) {
                var message = error ? error.data.message : _t('Cashdrawer not connected');
                var body = error ? error.data.debug : _t('Make sure Cashdrawer connected with IOT Box'); 
                self.pos.gui.show_popup('error-traceback', {
                    'title': _t('Cashdrawer Error: ') + message,
                    'body': body
                });
            });
            framework.blockUI();
            done.always(function () { 
                framework.unblockUI(); 
            });
            return done;
        },

        /*
            Displays the backoffice complete emptying wizard.
            @returns    0.00 - the dispensed amount
        */
        automatic_cashdrawer_display_complete_emptying: function () {
            var self = this;
            var done = this.message('cashlogy/display_complete_emptying');
            done.fail(function (error) {
                var message = error ? error.data.message : _t('Cashdrawer not connected');
                var body = error ? error.data.debug : _t('Make sure Cashdrawer connected with IOT Box');
                self.pos.gui.show_popup('error-traceback', {
                    'title': _t('Cashdrawer Error: ') + message,
                    'body': body
                });
            });
            framework.blockUI();
            done.always(function () { 
                framework.unblockUI(); 
            });
            return done;
        },

        /*
            Displays the backoffice empty stacker wizard.
            @returns    0.00 - the amount removed from stacker
        */
        automatic_cashdrawer_display_empty_stacker: function () {
            var self = this;
            var done = this.message('cashlogy/display_empty_stacker');
            done.fail(function (error) {
                var message = error ? error.data.message : _t('Cashdrawer not connected');
                var body = error ? error.data.debug : _t('Make sure Cashdrawer connected with IOT Box');
                self.pos.gui.show_popup('error-traceback', {
                    'title': _t('Cashdrawer Error: ') + message,
                    'body': body
                });
            });
            framework.blockUI();
            done.always(function () { 
                framework.unblockUI(); 
            });
            return done;
        },

        /*
            Dispenses money
            amount              float
            options.only_coins  default False

            @returns 0.00
        */
        automatic_cashdrawer_dispense: function (amount, options) {
            options = options || {};
            var self = this;
            var done = this.message('cashlogy/dispense', {
                'amount': amount,
                'options': options,
            });
            done.done(function (res) {
                if (res !== amount) {
                    console.error('Cashlogy', 'The dispensed amount was different than the requested', amount, res);
                }
            }).fail(function (error) {
                var message = error ? error.data.message : _t('Cashdrawer not connected');
                var body = error ? error.data.debug : _t('Make sure Cashdrawer connected with IOT Box');
                self.pos.gui.show_popup('error-traceback', {
                    'title': _t('Cashdrawer Error: ') + message,
                    'body': body
                });
            });
            return done;
        },

        /*
            Start add change
            Used to load money into the cashdrawer
            It has to be stopped using stop_acceptance
            The amount loaded so far can be queried with get_amount_accepted
        */
        automatic_cashdrawer_start_add_change: function () {
            var self = this;
            var done = this.message('cashlogy/start_add_change');
            done.fail(function (error) {
                var message = error ? error.data.message : _t('Cashdrawer not connected');
                var body = error ? error.data.debug : _t('Make sure Cashdrawer connected with IOT Box');
                self.pos.gui.show_popup('error-traceback', {
                    'title': _t('Cashdrawer Error: ') + message,
                    'body': body
                });
            });
            return done;
        },

        /*
            Start acceptance
            Similar to Start add change, but used for sales
            It has to be stopped using stop_acceptance
            The amount loaded so far can be queried with get_amount_accepted
        */
        automatic_cashdrawer_start_acceptance: function () {
            var self = this;
            var done = this.message('cashlogy/start_acceptance');
            done.fail(function (error) {
                var message = error ? error.data.message : _t('Cashdrawer not connected');
                var body = error ? error.data.debug : _t('Make sure Cashdrawer connected with IOT Box');
                self.pos.gui.show_popup('error-traceback', {
                    'title': _t('Cashdrawer Error: ') + message,
                    'body': body
                });
            });
            return done;
        },

        /*
            Returns the money accepted so far
            @returns 0.00
        */
        automatic_cashdrawer_get_amount_accepted: function () {
            var done = this.message('cashlogy/get_amount_accepted');
            // Silently fail
            done.fail(function (error) { 
                console.error(error); 
            });
            return done;
        },

        /*
            Stops acceptance of money
            @returns 0.00
        */
        automatic_cashdrawer_stop_acceptance: function () {
            var self = this;
            var done = this.message('cashlogy/stop_acceptance');
            done.fail(function (error) {
                var message = error ? error.data.message : _t('Cashdrawer not connected');
                var body = error ? error.data.debug : _t('Make sure Cashdrawer connected with IOT Box');
                self.pos.gui.show_popup('error-traceback', {
                    'title': _t('Cashdrawer Error: ') + message,
                    'body': body
                });
            });
            return done;
        },

        /*
            Gets the inventory of the machine
            Returns {total: {}, recycler: {}, stacker: {}}
        */
        automatic_cashdrawer_get_inventory: function () {
            var self = this;
            var done = this.message('cashlogy/get_inventory');
            done.fail(function (error) {
                var message = error ? error.data.message : _t('Cashdrawer not connected');
                var body = error ? error.data.debug : _t('Make sure Cashdrawer connected with IOT Box');
                self.pos.gui.show_popup('error-traceback', {
                    'title': _t('Cashdrawer Error: ') + message,
                    'body': body
                });
            });
            return done;
        },
        
        /*
            Gets the total amount on the machine
            Returns {total: 0.00, recycler: 0.00, stacker: 0.00}
        */
        automatic_cashdrawer_get_total_amount: function () {
            var self = this;
            var done = this.message('cashlogy/get_total_amount');
            done.fail(function (error) {
                var message = error ? error.data.message : _t('Cashdrawer not connected');
                var body = error ? error.data.debug : _t('Make sure Cashdrawer connected with IOT Box');
                self.pos.gui.show_popup('error-traceback', {
                    'title': _t('Cashdrawer Error: ') + message,
                    'body': body
                });
            });
            return done;
        },

        /*
            Prints the current inventory of the machine
        */
        automatic_cashdrawer_print_inventory: function () {
            this.pos.gui.show_popup('error', {
                title: _t('Not implemented'),
                body: _t('Method not implemented yet')
            });
            return $.Deferred().reject('Not implemented yet. TODO');
        },

        /*
            Displays the backoffice panel.
            TODO: Move this to pos_automatic_cashdrawer_cashlogy, or somehow toggle this feature
            depending on a supported feature list.
        */
        automatic_cashdrawer_display_backoffice: function () {
            // TODO : only managers should  be able to see/clic this button
            // Check for security group of current user
            // if (!true) { 
            //     return $.Deferred().reject(_t('AccessError')); 
            // }
            var self = this;
            var done = this.message('cashlogy/display_backoffice');
            done.fail(function (error) {
                var message = error ? error.data.message : _t('Cashdrawer not connected');
                var body = error ? error.data.debug : _t('Make sure Cashdrawer connected with IOT Box');
                self.pos.gui.show_popup('error-traceback', {
                    'title': _t('Cashdrawer Error: ') + message,
                    'body': body
                });
            });
            framework.blockUI();
            done.always(function () { 
                framework.unblockUI(); 
            });
            return done;
        },

    });

    return devices;
});
