/*
    POS Payment Terminal module for Odoo
    Copyright (C) 2014-2016 Aurélien DUMAINE
    Copyright (C) 2014-2016 Akretion (www.akretion.com)
    @author: Aurélien DUMAINE
    @author: Alexis de Lattre <alexis.delattre@akretion.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define('pos_payment_terminal.pos_payment_terminal', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');
    var devices = require('point_of_sale.devices');
    var models = require('point_of_sale.models');
    var core = require('web.core');
    var _t = core._t;
    var QWeb = core.qweb;

    models.load_fields('account.journal', ['payment_mode']);

    devices.ProxyDevice.include({
        payment_terminal_transaction_start: function(line_cid, currency_iso, currency_decimals){
            var line;
            var lines = this.pos.get_order().get_paymentlines();
            for ( var i = 0; i < lines.length; i++ ) {
                if (lines[i].cid === line_cid) {
                    line = lines[i];
                }
            }

            var data = {'amount' : line.get_amount(),
                        'currency_iso' : currency_iso,
                        'currency_decimals' : currency_decimals,
                        'payment_mode' : line.cashregister.journal.payment_mode};
            //console.log(JSON.stringify(data));
            this.message('payment_terminal_transaction_start', {'payment_info' : JSON.stringify(data)});
        },
    });


    screens.PaymentScreenWidget.include({
        render_paymentlines : function(){
        this._super.apply(this, arguments);
            var self  = this;
            this.$('.paymentlines-container').unbind('click').on('click', '.payment-terminal-transaction-start', function(event){
            // Why this "on" thing links severaltime the button to the action if I don't use "unlink" to reset the button links before ?
            //console.log(event.target);
            self.pos.proxy.payment_terminal_transaction_start($(this).data('cid'), self.pos.currency.name, self.pos.currency.decimals);
            });
        },
    });
});
