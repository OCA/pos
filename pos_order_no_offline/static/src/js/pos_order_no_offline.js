openerp.pos_order_no_offline = function(instance, local) {
    module = instance.point_of_sale;
    var QWeb = instance.web.qweb;
    var _t = instance.web._t;
    var round_pr = instance.web.round_precision;

    /*************************************************************************
        Extend Model PaymentScreenWidget:
    */

    module.PaymentScreenWidget = module.PaymentScreenWidget.extend({
        next_screen: 'products', // forbid to edit ticket with pdf
    })

    /*************************************************************************
        Extend Model Pos:
    */
    module.PosModel = module.PosModel.extend({

        push_order: function(order) {
            //this._super();
            if(order){
                var posOrderModel = new instance.web.Model('pos.order');
                return posOrderModel.call(
                    'create_from_ui',
                    [[{'data': order.export_as_JSON(), 'to_invoice': false}]],
                    undefined,
                    {
                        shadow: false, //!options.to_invoice,
                        timeout: 30000, //timeout
                    }).then(function (response) {
                        console.log(response)
                        return response;
                    }).fail(function (error, event){
                        if(error.code === 200 ){    // Business Logic Error, not a connection problem
                            /*self.pos_widget.screen_selector.show_popup('error-traceback',{
                                message: error.data.message,
                                comment: error.data.debug
                            });*/
                        }
                        // prevent an error popup creation by the rpc failure
                        // we want the failure to be silent as we send the orders in the background
                        event.preventDefault();
                        console.error('Failed to send orders:', order);
                });
            }
        },
    });
};
