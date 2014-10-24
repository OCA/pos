/*
    POS Customer display module for Odoo
    Copyright (C) 2014 Aurélien DUMAINE
    Copyright (C) 2014 Barroux Abbey (www.barroux.org)
    @author: Aurélien DUMAINE
    @author: Alexis de Lattre <alexis.delattre@akretion.com>
    @author: Father Odilon (Barroux Abbey)
    The licence is in the file __openerp__.py
*/

openerp.pos_customer_display = function(instance){
    module = instance.point_of_sale;

    var _t = instance.web._t;


    module.PosModel = module.PosModel.extend({
        prepare_text_customer_display: function(type, data){
            if (this.config.iface_customer_display != true)
                return;
            var line_length = this.config.customer_display_line_length || 20;
            var currency_rounding = Math.ceil(Math.log(1.0 / this.currency.rounding) / Math.log(10));

            if (type == 'addProduct'){
                // in order to not recompute qty in options..., we assume that the new ordeLine is the last of the collection
                // addOrderline exists but is not called by addProduct, should we handle it ?
                var line = this.get('selectedOrder').getLastOrderline(); 
                var price_unit = line.get_unit_price() * (1.0 - (line.get_discount() / 100.0));
                price_unit = price_unit.toFixed(currency_rounding);
                var l21 = line.get_quantity_str_with_unit() + ' x ' + price_unit;
                var l22 = ' ' + line.get_display_price().toFixed(currency_rounding);
                var lines_to_send = new Array(
                    this.proxy.align_left(line.get_product().display_name, line_length),
                    this.proxy.align_left(l21, line_length - l22.length) + l22
                    );

            } else if (type == 'removeOrderline') {
                // first click on the backspace button set the amount to 0 => we can't precise the deleted qunatity and price
                var line = data['line'];
                var lines_to_send = new Array(
                    this.proxy.align_left(_t("Delete Item"), line_length),
                    this.proxy.align_right(line.get_product().display_name, line_length)
                    );

            } else if (type == 'addPaymentline') {
                var total = this.get('selectedOrder').getTotalTaxIncluded().toFixed(currency_rounding);
                var lines_to_send = new Array(
                    this.proxy.align_left(_t("TOTAL: "), line_length),
                    this.proxy.align_right(total, line_length)
                    );

            } else if (type == 'removePaymentline') {
                var line = data['line'];
                var amount = line.get_amount().toFixed(currency_rounding);
                var lines_to_send = new Array(
                    this.proxy.align_left(_t("Cancel Payment"), line_length),
                    this.proxy.align_right(line.cashregister.journal_id[1] , line_length - 1 - amount.length) + ' ' + amount
                    );

            } else if (type == 'update_payment') {
                var change = data['change'];
                var lines_to_send = new Array(
                    this.proxy.align_left(_t("Your Change:"), line_length),
                    this.proxy.align_right(change, line_length)
                );

            } else if (type == 'pushOrder') {
                var lines_to_send = new Array(
                    this.proxy.align_center(_t("Next Customer"), line_length),
                    this.proxy.align_left(' ', line_length)
                    );

            } else if (type == 'openPOS') {
                var lines_to_send = new Array(
                    this.proxy.align_center(_t("Point of Sale Open"), line_length),
                    this.proxy.align_left(' ', line_length)
                    );

            } else if (type = 'closePOS') {
                var lines_to_send = new Array(
                    this.proxy.align_center(_t("Point of Sale Closed"), line_length),
                    this.proxy.align_left(' ', line_length)
                    );
            } else {
                console.warn('Unknown message type');
                return;
            }

            this.proxy.send_text_customer_display(lines_to_send, line_length);
            //console.log('prepare_text_customer_display type=' + type + ' | l1=' + lines_to_send[0] + ' | l2=' + lines_to_send[1]);
        },

    });


    module.ProxyDevice = module.ProxyDevice.extend({
        send_text_customer_display: function(data, line_length){
            //FIXME : this function is call twice. The first time, it is not called by prepare_text_customer_display : WHY ?
            if (_.isEmpty(data) || data.length != 2 || data[0].length != line_length || data[1].length != line_length){
                console.warn("send_text_customer_display: Bad Data argument. Data=" + data + ' line_length=' + line_length);
            } else {
//              alert(JSON.stringify(data));
                return this.message('send_text_customer_display', {'text_to_display' : JSON.stringify(data)});
            }
        },

        align_left: function(string, length){
            if (string) {
               if (string.length > length)
               {
                    return string.substring(0,length);
               }
               else if (string.length < length)
               {
                    while(string.length < length)
                         string = string + ' ';
                    return string;
               }
            }
            return string;
        },

       align_right: function(string, length){
            if (string) {
                if (string.length > length)
                 {
                    return string.substring(0,length);
                 }
                 else if (string.length < length)
                 {
                    while(string.length < length)
                          string = ' ' + string;
                    return string;
                }
             }
             return string;
       },

       align_center: function(string, length){
            if (string) {
                if (string.length > length)
                {
                   return string.substring(0, length);
                }
                else if (string.length < length)
                {
                   ini = (length - string.length) / 2;
                   while(string.length < length - ini)
                         string = ' ' + string;
                   while(string.length < length)
                         string = string + ' ';
                   return string;
                }
             }
             return string;
       },
    });

    var _super_addProduct_ = module.Order.prototype.addProduct;
    module.Order.prototype.addProduct = function(product, options){
        res = _super_addProduct_.call(this, product, options);
        if (product) {
            this.pos.prepare_text_customer_display('addProduct', {'product' : product, 'options' : options});
        }
        return res;
    };

    var _super_removeOrderline_ = module.Order.prototype.removeOrderline;
    module.Order.prototype.removeOrderline = function(line){
        if (line) {
            this.pos.prepare_text_customer_display('removeOrderline', {'line' : line});
        }
        return _super_removeOrderline_.call(this, line);
    };

    var _super_removePaymentline_ = module.Order.prototype.removePaymentline;
    module.Order.prototype.removePaymentline = function(line){
        if (line) {
            this.pos.prepare_text_customer_display('removePaymentline', {'line' : line});
        }
        return _super_removePaymentline_.call(this, line);
    };

    var _super_addPaymentline_ = module.Order.prototype.addPaymentline;
    module.Order.prototype.addPaymentline = function(cashregister){
        res = _super_addPaymentline_.call(this, cashregister);
        if (cashregister) {
            this.pos.prepare_text_customer_display('addPaymentline', {'cashregister' : cashregister});
        }
        return res;
    };

    var _super_pushOrder_ = module.PosModel.prototype.push_order;
    module.PosModel.prototype.push_order = function(order){
        res = _super_pushOrder_.call(this, order);
        if (order) {
            this.prepare_text_customer_display('pushOrder', {'order' : order});
        }
        return res;
    };

    var _super_update_payment_summary_ = module.PaymentScreenWidget.prototype.update_payment_summary;
    module.PaymentScreenWidget.prototype.update_payment_summary = function(){
        res = _super_update_payment_summary_.call(this);
        var currentOrder = this.pos.get('selectedOrder');
        var paidTotal = currentOrder.getPaidTotal();
        var dueTotal = currentOrder.getTotalTaxIncluded();
        var change = paidTotal > dueTotal ? paidTotal - dueTotal : 0;
        if (change) {
            change_rounded = change.toFixed(2);
            this.pos.prepare_text_customer_display('update_payment', {'change': change_rounded});
        }
        return res;
    };

    var _super_closePOS_ = module.PosWidget.prototype.close;
    module.PosWidget.prototype.close = function(){
        this.pos.prepare_text_customer_display('closePOS', {});
        return _super_closePOS_.call(this);
    };

    var _super_proxy_start_ = module.ProxyStatusWidget.prototype.start;
    module.ProxyStatusWidget.prototype.start = function(){
        res = _super_proxy_start_.call(this);
        this.pos.prepare_text_customer_display('openPOS', {});
        return res;
    };

};
