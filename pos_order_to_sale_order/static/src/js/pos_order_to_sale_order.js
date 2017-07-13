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
            this.display_text = _t("Create Draft Order");
            if (this.pos.config.iface_create_sale_order_action == 'confirmed_order'){
                this.display_text = _t("Create Confirmed Order");
            }
            if (this.pos.config.iface_create_sale_order_action == 'delivered_picking'){
                this.display_text = _t("Create Delivered Picking");
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
                if (current_order.get('client') ===  null){
                    self.pos_widget.screen_selector.show_popup('error',{
                        'message': _t('No customer defined'),
                        'comment': _t('You should select a customer in order to create a Sale Order. Please select one by clicking the order tab.'),
                    });
                    return;
                }
                self.pos.pos_widget.screen_selector.show_popup('confirm', {
                    message: _t('Create Sale Order and discard the current PoS Order ?'),
                    comment: _t("This operation will permanently destroy the current PoS Order and create a Sale Order, based on the current order lines. You'll have to create later an invoice.\n Note if you had manually changed unit prices for some products, this changes will not been taken into account in the sale order, and should be done manually on the invoice again."),
                    confirm: function(){
                        var SaleOrderModel = new instance.web.Model('sale.order');
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
            return order.export_as_JSON();
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
            * Create a new button, depending of the configuration
    */
    module.PosWidget = module.PosWidget.extend({
        build_widgets: function() {
            this._super();
            if (this.pos.config.iface_create_sale_order){
                this.create_sale_order_button = new module.CreateSaleOrderButtonWidget(this, {});
                this.create_sale_order_button.appendTo(this.pos_widget.$('ul.orderlines'));
            }
        },
    });


    /*************************************************************************
        Extend OrderWidget:
            Overload renderElement, to display button when the order change.
    */
    module.OrderWidget = module.OrderWidget.extend({
        renderElement: function(scrollbottom){
            this._super(scrollbottom);
            if (this.pos_widget.create_sale_order_button) {
                this.pos_widget.create_sale_order_button.appendTo(
                    this.pos_widget.$('ul.orderlines')
                );
            }
        }
    });

};
