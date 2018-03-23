/******************************************************************************
    Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 *****************************************************************************/

openerp.pos_order_to_sale_order = function(instance, local) {

    "use strict";

    var module = instance.point_of_sale;
    var _t = instance.web._t;

    /*************************************************************************
        New Widget CreateSaleOrderButtonWidget:
            * On click, check if there is a customer defined,
              ask confirmation call server to create sale order, and delete
              the current order. 
    */
    module.CreateSaleOrderButtonWidget = module.PosBaseWidget.extend({
        template: 'CreateSaleOrderButtonWidget',

        init: function(parent, options){
            this._super(parent, options);
            this.sale_order_state = options.sale_order_state;
            if (this.sale_order_state == 'draft') {
                this.display_text = _t("Create Draft Order");
                this.confirmation_message = _t('Create Draft Sale Order and discard the current PoS Order?');
                this.confirmation_comment = _t("This operation will permanently discard the current PoS Order and create a draft Sale Order, based on the current order lines.");
                console.log(this);
            }
            else if (options.sale_order_state == 'confirmed') {
                this.display_text = _t("Create Confirmed Order");
                this.confirmation_message = _t('Create Confirmed Sale Order and discard the current PoS Order?');
                this.confirmation_comment = _t("This operation will permanently discard the current PoS Order and create a confirmed Sale Order, based on the current order lines.");
            }
            else if (options.sale_order_state == 'delivered') {
                this.display_text = _t("Create Delivered Order");
                this.confirmation_message = _t('Create Delivered Sale Order and discard the current PoS Order?');
                this.confirmation_comment = _t("This operation will permanently discard the current PoS Order and create a confirmed Sale Order, based on the current order lines. The according picking will be marked as delivered.");
            }
            if (! this.pos.pricelist_engine){
                this.confirmation_comment += _t("\nNote if you have manually changed unit prices for some products, this changes will not been taken into account in the sale order.")
            }
        },

        renderElement: function() {
            var self = this;
            this._super();
            this.$el.click(function(){
                var current_order = self.pos.get('selectedOrder');
                // Prevent empty delivery order
                if (current_order.get('orderLines').length == 0){
                    self.pos_widget.screen_selector.show_popup('error',{
                        'message': _t('Empty Order'),
                        'comment': _t('There must be at least one product in your order to create Sale Order.'),
                    });
                    return;
                }
                // Check Customer
                if (!current_order.get('client')){
                    self.pos_widget.screen_selector.show_popup('error',{
                        'message': _t('No customer defined'),
                        'comment': _t('You should select a customer in order to create a Sale Order. Please select one by clicking the order tab.'),
                    });
                    return;
                }
                self.pos.pos_widget.screen_selector.show_popup('confirm', {
                    message: self.confirmation_message,
                    comment: self.confirmation_comment,
                    confirm: function(){
                        var SaleOrderModel = new instance.web.Model('sale.order');
                        current_order.sale_order_state = self.sale_order_state;
                        SaleOrderModel.call('create_order_from_pos', [self.prepare_create_sale_order(current_order)]
                        ).then(function (result) {
                            self.hook_create_sale_order_success(result);
                        }).fail(function (error, event){
                            self.hook_create_sale_order_error(error, event);
                        });
                        
                    },
                });
            });
        },

        // Overload This function to send custom sale order data to server
        prepare_create_sale_order: function(order) {
            var res = order.export_as_JSON();
            res.sale_order_state = this.sale_order_state;
            return res;
        },

        // Overload this function to make custom action after Sale order
        // Creation success
        hook_create_sale_order_success: function(result) {
            this.pos.get('selectedOrder').destroy();
        },

        // Overload this function to make custom action after Sale order
        // Creation fail
        hook_create_sale_order_error: function(error, event) {
            event.preventDefault();
            if(error.code === 200 ){
                // Business Logic Error, not a connection problem
                this.pos_widget.screen_selector.show_popup('error-traceback',{
                    message: error.data.message,
                    comment: error.data.debug,
                });
            }
            else{
                // connexion problem
                this.pos_widget.screen_selector.show_popup('error',{
                    message: _t('The order could not be sent'),
                    comment: _t('Check your internet connection and try again.'),
                });
            }

        },

    });


    /*************************************************************************
        Extend PosWidget:
            * Create new buttons, depending of the configuration
    */
    module.PosWidget = module.PosWidget.extend({
        build_widgets: function() {
            this._super();
            if (this.pos.config.iface_create_draft_sale_order){
                this.create_draft_sale_order_button = new module.CreateSaleOrderButtonWidget(
                    this, {'sale_order_state': 'draft'});
                this.create_draft_sale_order_button.appendTo(this.pos_widget.$('ul.orderlines'));
            }
            if (this.pos.config.iface_create_confirmed_sale_order){
                this.create_confirmed_sale_order_button = new module.CreateSaleOrderButtonWidget(
                    this, {'sale_order_state': 'confirmed'});
                this.create_confirmed_sale_order_button.appendTo(this.pos_widget.$('ul.orderlines'));
            }
            if (this.pos.config.iface_create_delivered_sale_order){
                this.create_delivered_sale_order_button = new module.CreateSaleOrderButtonWidget(
                    this, {'sale_order_state': 'delivered'});
                this.create_delivered_sale_order_button.appendTo(this.pos_widget.$('ul.orderlines'));
            }
        },
    });


    /*************************************************************************
        Extend OrderWidget:
            Overload renderElement, to display buttons when the order change.
    */
    module.OrderWidget = module.OrderWidget.extend({
        renderElement: function(scrollbottom){
            this._super(scrollbottom);
            if (this.pos_widget.create_draft_sale_order_button) {
                this.pos_widget.create_draft_sale_order_button.appendTo(
                    this.pos_widget.$('ul.orderlines')
                );
            }
            if (this.pos_widget.create_confirmed_sale_order_button) {
                this.pos_widget.create_confirmed_sale_order_button.appendTo(
                    this.pos_widget.$('ul.orderlines')
                );
            }
            if (this.pos_widget.create_delivered_sale_order_button) {
                this.pos_widget.create_delivered_sale_order_button.appendTo(
                    this.pos_widget.$('ul.orderlines')
                );
            }

        }
    });

};
