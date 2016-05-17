/*
    POS Payment Terminal module for Odoo
    Copyright (C) 2014-2016 Aurélien DUMAINE
    Copyright (C) 2014-2015 Akretion (www.akretion.com)
    @author: Aurélien DUMAINE
    @author: Alexis de Lattre <alexis.delattre@akretion.com>
    The licence is in the file __openerp__.py
*/

odoo.define('pos_payment_terminal.pos_payment_terminal', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');
    var devices = require('point_of_sale.devices');
    var models = require('point_of_sale.models');
//    var gui = require('point_of_sale.gui');
    var core = require('web.core');
    var _t = core._t;
    var QWeb = core.qweb;

    models.load_fields("account.journal",['payment_mode']);

    devices.ProxyDevice.include({
        payment_terminal_transaction_start: function(line_cid, currency_iso){
            var line;
            var lines = this.pos.get_order().get_paymentlines();
            for ( var i = 0; i < lines.length; i++ ) {
                if (lines[i].cid === line_cid) {
                    line = lines[i];
                }
            }

            var data = {'amount' : line.get_amount(),
                        'currency_iso' : currency_iso,
                        'payment_mode' : line.cashregister.journal.payment_mode};
//alert(JSON.stringify(data));
            this.message('payment_terminal_transaction_start', {'payment_info' : JSON.stringify(data)});
        },
    });


// TODO : overload instead of redefine
// BUG : its works fine when redefine but calls 5 times the function is overload
    screens.PaymentScreenWidget.include({
	render_paymentlines : function(){
   	    this._super.apply(this, arguments);
            var self  = this;
            this.$('.paymentlines-container').on('click','.payment-terminal-transaction-start',function(){
                self.pos.proxy.payment_terminal_transaction_start($(this).data('cid'), self.pos.currency.name);
            });

/*
        var self  = this;
        var order = this.pos.get_order();
        if (!order) {
            return;
        }

        var lines = order.get_paymentlines();
        var due   = order.get_due();
        var extradue = 0;
        if (due && lines.length  && due !== order.get_due(lines[lines.length-1])) {
            extradue = due;
        }


        this.$('.paymentlines-container').empty();
        var lines = $(QWeb.render('PaymentScreen-Paymentlines', {
            widget: this,
            order: order,
            paymentlines: lines,
            extradue: extradue,
        }));

        lines.on('click','.delete-button',function(){
            self.click_delete_paymentline($(this).data('cid'));
        });

        lines.on('click','.paymentline',function(){
            self.click_paymentline($(this).data('cid'));
        });

        lines.on('click','.payment-terminal-transaction-start',function(){
            self.pos.proxy.payment_terminal_transaction_start($(this).data('cid'), self.pos.currency.name);
        });

        lines.appendTo(this.$('.paymentlines-container'));
*/
    },

    });
});
