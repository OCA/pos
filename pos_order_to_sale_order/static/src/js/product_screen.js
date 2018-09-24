/******************************************************************************
    Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author: Raphaël Reverdy (https://akretion.com)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 *****************************************************************************/
odoo.define('pos_order_to_sale_order.product_screen', function (require) {
    "use strict";
    var translation = require('web.translation');
    var _t = translation._t;
    var ProductScreenWidget = require('point_of_sale.screens');
    var Model = require('web.DataModel');
    var stateMachine = require('pos_order_to_sale_order.state_machine');
    var uiWidgets = require('pos_order_to_sale_order.ui_widgets');

    ProductScreenWidget.PaymentScreenWidget.include({
        init: function(parent, options) {
            this._super(parent, options);
            this.init_listeners();
            this.init_config();
            this.init_buttons();
            stateMachine.init();
        },
        init_listeners: function() {
            var self = this;
            stateMachine.listeners.push(function (next, prev) {
                //show or hide numpad and payment method
                //based on isPayable
                var action = null;
                if (next.isPayable) {
                    action = 'show';
                } else {
                    action = 'hide';
                }
                self.$el.find('.payment-numpad')[action]();
                self.$el.find('.paymentmethod')[action]();
            });
            stateMachine.listeners.push(function (next, prev) {
                //remove payment line if order is not payable
                //or if payment is not allowed
                if (next.isPayable) {
                    self.$el.find('.message').show();
                } else {
                    // remove all paymentlines
                    var order = self.pos.get_order();
                    var lines = order.get_paymentlines();
                    lines.forEach(function (line) {
                        order.remove_paymentline(line);
                    });
                    self.reset_input();
                    self.render_paymentlines();
                    //should be done after reset !
                    self.$el.find('.message').hide();
                }
            });
            stateMachine.listeners.push(function (next, prev) {
                //hide/show invoice button if order is (not) invoicable
                var order = self.pos.get_order();
                if (['confirmed', 'delivered', 'poso', 'invoiced'].indexOf(stateMachine.current.name) != -1) {
                    if (order.to_invoice) {
                        self.$('.js_invoice').addClass('highlight');
                    }
                    self.$('.js_invoice').removeClass('disabled');
                } else {
                    // hide
                    order.to_invoice = false;
                    self.$('.js_invoice').removeClass('highlight')
                    self.$('.js_invoice').addClass('disabled');
                }
            });
        },

        init_config: function () {
            var allowedStates = stateMachine.allowedStates;
            if (this.pos.config.iface_allow_draft_order) {
                allowedStates.push('draft');
            }
            if (this.pos.config.iface_allow_confirmed_order) {
                allowedStates.push('confirmed');
            }
            if (this.pos.config.iface_allow_delivered_order) {
                allowedStates.push('delivered');
            }
            if (this.pos.config.iface_invoicing) {
                allowedStates.push('invoiced');
            }
            if (this.pos.config.iface_allow_pos_order) {
                allowedStates.push('poso');
            }
            if (this.pos.config.iface_allow_payment) {
                stateMachine.allowPayment = true;
            }
        },
        init_buttons: function () {
            this.deliveryLater = new uiWidgets.DeliveryButtonWidget(parent, {});
            this.payLater = new uiWidgets.PayLaterButtonWidget(parent, {});
            this.orderType = new uiWidgets.OrderTypeButtonWidget(parent, {});
        },
        renderElement: function() {
            this._super();
            var allowedStates = stateMachine.allowedStates;
            if (allowedStates.length == 1) {
                //no choices : no widget to display
                return;
            }
            if (allowedStates.indexOf('draft') != -1) {
                this.payLater.prependTo(this.$('.paymentmethods'));
            }
            if (allowedStates.indexOf('delivered') != -1) {
                this.deliveryLater.appendTo(this.$('.payment-buttons'));
            }
            if (allowedStates.indexOf('poso') != -1 && allowedStates.length > 1) {
                // sales orders (draft|confirmed|delivered) AND PoS order
                this.orderType.prependTo(this.$('.paymentmethods'));
            }
            stateMachine.notify(); //start with stable state
        },
        order_is_valid: function(force_validation) {
            //there is no payment on draft
            //payment is not mandatory on sale orders
            //the trick to pass validation without payment
            //is to set invoicing = false
            //and patch order.is_paid
            //see screens.js:1933
            //we revert it back at the end to limit side effects.
            var res = null;
            var order = this.pos.get_order();
            var prev_is_paid = order.is_paid;
            var prev_invoicing = this.invoicing;
            if (!stateMachine.current.isPosOrder) {
                order.is_paid = function() {
                    return true;
                };
                this.invoicing = false;
            }
            res = this._super(force_validation);
            if (!stateMachine.current.isPosOrder) {
                //if something bad happends, so user
                //want to save it as PoS Order
                order.is_paid = prev_is_paid;
                this.invoicing = prev_invoicing;
            }
            return res;
        },
        validate_order: function(force_validation) {
            var self = this;
            // use our flow only if sale order
            if (stateMachine.current.isPosOrder) {
                return this._super(force_validation);
            }
            //client is mandatory for Invoice Only
            if(!this.pos.get_order().get_client() & stateMachine.current.isInvoicable){
                this.gui.show_popup('confirm', {
                    'title': _t('Please select the Customer'),
                    'body': _t('You need to select the customer before you can invoice an order.'),
                    confirm: function(){
                        self.click_set_customer();
                    },
                });
                return false;
            }
            if (this.order_is_valid(force_validation)) {
                return this.finalize_validation_sale_order();
            }
        },
        finalize_validation_sale_order: function() {
            //here we save the order to backend
            var self = this;
            var current_order = self.pos.get('selectedOrder');
            return new Model('sale.order').call(
                'create_order_from_pos',
                [self.prepare_create_sale_order(current_order)]
            ).then(function (result) {
                if (current_order.is_to_invoice()){
                    // generate the pdf and download it
                    self.chrome.do_action(
                        'pos_order_to_sale_order.pos_sale_order_invoice_report',
                        { additional_context:{ active_ids: [result['sale_order_id']] }}
                    );
                }
                return result;
            }).then(function (result) {
                return self.hook_create_sale_order_success(result);
            }).fail(function (error){
                return self.hook_create_sale_order_error(error);
            });
        },
        // Overload This function to send custom sale order data to server
        prepare_create_sale_order: function(order) {
            var res = order.export_as_JSON();
            res.sale_order_state = stateMachine.current.name;
            res.to_invoice = order.to_invoice;
            return res;
        },
        // Overload this function to make custom action after Sale order
        // Creation success
        hook_create_sale_order_success: function(result) {
            return this.pos.get('selectedOrder').destroy();
        },
        // Overload this function to make custom action after Sale order
        // Creation fail
        hook_create_sale_order_error: function(error) {
            if (error.code === 200) {
                // Business Logic Error, not a connection problem
                this.gui.show_popup('error-traceback', {
                    message: error.data.message,
                    comment: error.data.debug,
                });
            } else {
                // connexion problem
                this.gui.show_popup('error', {
                    message: _t('The order could not be sent'),
                    comment: _t('Check your internet connection and try again.'),
                });
            }
        },
        click_invoice: function(){
            /* this is not a widget because invoice button is defined in
            point_of_sale/.../screens.js
            */
            var order = this.pos.get_order();
            if (['confirmed', 'delivered', 'poso', 'invoiced'].indexOf(stateMachine.current.name) != -1) {
                this._super();
                if (order.to_invoice && stateMachine.current.name != 'draft') {
                    // stateMachine.enter('delivered');
                    stateMachine.enter('invoiced');
                }
                if (!order.to_invoice){
                    stateMachine.toggle('invoiced');
                }
            }
        },

    });
});
