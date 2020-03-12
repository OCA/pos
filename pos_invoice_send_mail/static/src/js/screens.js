/* Copyright 2019 Druidoo - Iván Todorovich
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
   
odoo.define('pos_invoice_send_mail.screens', function (require) {
    "use strict";

var core = require('web.core');
var screens = require('point_of_sale.screens');
var _t = core._t;

screens.PaymentScreenWidget.include({
    renderElement: function() {
        var self = this;
        this._super();
        this.$('.js_send_mail').click(function(){
            self.click_send_mail();
        });
    },
    click_send_mail: function() {
        var order = this.pos.get_order();
        order.set_to_send_mail(!order.is_to_send_mail());
        if (order.is_to_send_mail()) {
            this.$('.js_send_mail').addClass('highlight');
        } else {
            this.$('.js_send_mail').removeClass('highlight');
        }
        if (order.is_to_send_mail() && !order.is_to_invoice()) {
            this.click_invoice();
        }
    },
    click_invoice: function() {
        this._super();
        var order = this.pos.get_order();
        if (!order.is_to_invoice() && order.is_to_send_mail()) {
            this.click_send_mail();
        }
    },
});

screens.ScreenWidget.include({
    _handleFailedPushForInvoice: function(order, refresh_screen, error) {
        var self = this;
        order = order || this.pos.get_order();
        this.invoicing = false;
        order.finalized = false;
        if (error.message === 'Missing Customer Email') {
            this.gui.show_popup('confirm', {
                'title': _t('Please fill the customer email'),
                'body': _t('You need to complete the customer email in order to send it.'),
                confirm: function(){
                    self.gui.show_screen('clientlist', null, refresh_screen);
                },
            });
        } else {
            return this._super(order, refresh_screen, error);
        }
    },
});

});
