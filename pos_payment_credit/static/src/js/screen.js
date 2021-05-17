/* License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
   odoo.define('pos_payment_credit.screens', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');
    var core = require('web.core');
    var _t = core._t;
    var PaymentScreenWidget = screens.PaymentScreenWidget;

    PaymentScreenWidget.include({
        customer_changed: function () {
            this._super.apply(this, arguments);
            var client = this.pos.get_client();
            // Clear the credit payment
            if (client && client.credit_amount){
                this.$('.js_customer_credit').text( _t("Available Credit:") + " " + this.format_currency(client.credit_amount));
            }
            else {
                this.$('.js_customer_credit').text("");
            }
        },
        click_paymentmethods: function(id) {
            this._super.apply(this, arguments);
            // Update the amount based on the credit amount
            this.apply_credit_amount();
        },
        apply_credit_amount: function() {
            var self = this;
            var order = this.pos.get_order();
            var line = order.selected_paymentline;
            if (line && line.get_credit_payment()) {
                var client = this.pos.get_client();
                var amount = order.get_due(line);
                amount = Math.max(0, Math.min(amount, client.credit_amount));
                var amountFormatted = self.format_currency_no_symbol(amount);
                line.set_amount(amount);
                self.order_changes();
                self.render_paymentlines();
                self.$('.paymentline.selected .edit').text(amountFormatted);
                self.gui.show_popup('confirm', {
                    'title': _t('Confirming'),
                    'body': _t("Pay using the member's available credit?"),
                    confirm: function () {},
                    cancel: function () {
                        var selectedPaymentLineEle = $('.paymentline.selected');
                        if (selectedPaymentLineEle) {
                            var paymentLineId = $(selectedPaymentLineEle[0]).find('.delete-button').data('cid');
                            if(paymentLineId){
                                self.click_delete_paymentline(paymentLineId);   
                            }
                        }
                    },
                });
            }
        },
        payment_input: function(input) {
            this._super.apply(this, arguments);

            // popup block inputs to prevent sneak editing. 
            if (this.gui.has_popup()) {
                return;
            }
            var self = this;
            var order = this.pos.get_order();
            var line = order.selected_paymentline;
            if (line && line.get_credit_payment()) {
                var client = this.pos.get_client();
                var due_amount = order.get_due(line);
                var line_amount = line.get_amount();
                var amount =  Math.min(due_amount, line_amount);
                var inamount = Math.max(0, Math.min(amount, client.credit_amount));
                if (line_amount != inamount){
                    // Update the buffer
                    self.inputbuffer = inamount.toString();

                    var amountFormatted = self.format_currency_no_symbol(inamount);
                    line.set_amount(inamount);
                    self.order_changes();
                    self.render_paymentlines();
                    self.$('.paymentline.selected .edit').text(amountFormatted);
                    self.gui.show_popup('alert', {
                        title: _t('Error'),
                        body: _t('The credit amount is invalid!'),
                    });
                }
            }
        },
    });
    screens.ClientListScreenWidget.include({
        // When changing a customer, we want to destroy the credit
        // payment lines
        // because they could be linked to another customer.
        // Just in case we destroy all
        has_client_changed: function () {
            var changed = this._super();
            if (changed){
                var order = this.pos.get('selectedOrder');
                var paymentlines = order.paymentlines;
                for (var i = 0; i < paymentlines.models.length; i++) {
                    var payment_line = paymentlines.models[i];
                    if (payment_line.get_credit_payment()){
                        payment_line.destroy();
                    }
                }
            }
            return changed
        },
    });
});
