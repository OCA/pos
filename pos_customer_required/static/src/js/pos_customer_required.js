openerp.pos_customer_required = function(instance){

    var QWeb = instance.web.qweb,
    _t = instance.web._t;
    var module = instance.point_of_sale;

    module.PaymentScreenWidget.include({
        validate_order: function(options) {
            var self = this;
            options = options || {};

            var currentOrder = this.pos.get('selectedOrder');

            if( this.pos.config.require_customer && !currentOrder.get_client()){
                self.pos_widget.screen_selector.show_popup('error',{
                    message: _t('An anonymous order cannot be confirmed'),
                    comment: _t('Please select a client for this order. This can be done by clicking the order tab')
                });
                return;
            }
            // else
            return this._super(options);
        }
    });

};
