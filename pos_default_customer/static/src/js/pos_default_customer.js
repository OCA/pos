openerp.pos_default_customer = function(instance){

    var QWeb = instance.web.qweb,
    _t = instance.web._t;
    var module = instance.point_of_sale;

    
    
/* ********************************************************
Overload: point_of_sale.PosModel

*********************************************************** */
    var _add_new_order_ = module.PosModel.prototype.add_new_order;
    module.PosModel.prototype.add_new_order = function(session, attributes){
        result = _add_new_order_.call(this, session, attributes);
        var order = this.get('selectedOrder');
        var default_client;
        var default_partner_id = order.pos.config.default_partner_id;
        var client_id;
        if (default_partner_id) {
            client_id = parseInt(default_partner_id[0]);
            default_client = this.db.get_partner_by_id(client_id);
            if (default_client) {
                order.set_client(default_client);
            }
        }
    }

};
