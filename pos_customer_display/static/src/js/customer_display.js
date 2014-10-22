openerp.pos_customer_display = function(instance){
    module = instance.point_of_sale;

    var _t = instance.web._t;
    var round_di = instance.web.round_decimals;
    var round_pr = instance.web.round_precision;


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
                    this.proxy.complete_string_right(line.get_product().display_name, line_length),
                    this.proxy.complete_string_right(l21, line_length - l22.length) + l22
                    );

            } else if (type == 'removeOrderline') {
                // first click on the backspace button set the amount to 0 => we can't precise the deleted qunatity and price
                var line = data['line'];
                var lines_to_send = new Array(
                    this.proxy.complete_string_center(_t("Delete item"), line_length),
                    this.proxy.complete_string_center(line.get_product().name, line_length)
                    );

            } else if (type == 'addPaymentline') {
                var cashregister = data['cashregister'];
                var total = this.get('selectedOrder').getTotalTaxIncluded().toFixed(currency_rounding);
                var lines_to_send = new Array(
                    this.proxy.complete_string_right(_t("TOTAL: "), line_length - 1 - total.length) + ' ' + total,
                    this.proxy.complete_string_right(_t("Payment:"), line_length - 1 - cashregister.journal_id[1].length) + ' ' + cashregister.journal_id[1]
                    );

            } else if (type == 'removePaymentline') {
                var line = data['line'];
                var amount = line.get_amount().toFixed(currency_rounding);
                var lines_to_send = new Array(
                    this.proxy.complete_string_center(_t("Delete payment"), line_length),
                    this.proxy.complete_string_right(line.cashregister.journal_id[1] , line_length - 1 - amount.length) + ' ' + amount
                    );

            } else if (type == 'pushOrder') {
                var order = data['order'];
                var paidTotal = order.getPaidTotal();
                var dueTotal = order.getTotalTaxIncluded();
                var remaining = dueTotal > paidTotal ? dueTotal - paidTotal : 0;
                var change = paidTotal > dueTotal ? paidTotal - dueTotal : 0;

                var l1;
                if (change == 0){
                    l1 = this.proxy.complete_string_center(_t(""), line_length);
                } else {
                    change = change.toFixed(currency_rounding);
                    l1 = this.proxy.complete_string_right(_t("YOUR CHANGE:"), line_length - 1 - change.length) + ' ' + change;
                }

                var lines_to_send = new Array(
                    l1,
                    this.proxy.complete_string_center(_t("Next customer..."), line_length)
                    );

                } else if (type = 'closePOS') {
                    var lines_to_send = new Array(
                        this.proxy.complete_string_center(_t("Point of sale closed"), line_length),
                        this.proxy.complete_string_center(_t("***"), line_length)
                    );
            } else {
                console.warn('Unknown message type');
                return;
            }

//          alert("In prepare_text_customer_display " + line_length);
            this.proxy.send_text_customer_display(lines_to_send, line_length);
        },

    });


    module.ProxyDevice = module.ProxyDevice.extend({
        send_text_customer_display: function(data, line_length){
            //FIXME : this function is call twice. The first time, it is not called by prepare_text_customer_display : WHY ?
            if (_.isEmpty(data) || data.lenght != 2 || data[0].length != line_length || data[1].length != line_length){
                console.warn("Bad Data argument. Data = " + data);
                console.warn('Line_length = ' + line_length);
            } else {
//              alert(JSON.stringify(data));
                return this.message('send_text_customer_display', {'text_to_display' : JSON.stringify(data)});
            }
        },
        complete_string_right: function(string, length){
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
       complete_string_left: function(string, length){
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
       complete_string_center: function(string, length){
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


    //FIXME : nothing happen on customer display deconnection
    var _super_setSmartStatus_ = module.ProxyStatusWidget.prototype.set_smart_status;
    module.ProxyStatusWidget.prototype.set_smart_status = function(status){
        _super_setSmartStatus_.call(this, status);
        if (status.status === 'connected') {
            var warning = false;
            var msg = '';
            if (this.pos.config.iface_customer_display) {
                var customer_display = status.drivers.customer_display ? status.drivers.customer_display.status : false;
                if (customer_display != 'connected' && customer_display != 'connecting') {
                    warning = true;
                    msg = msg ? msg + ' & ' : msg;
                    msg += _t('Customer display');
                }
            }
            msg = msg ? msg + ' ' + _t('Offline') : msg;
            this.set_status(warning ? 'warning' : 'connected', msg);
        } else {
            this.set_status(status.status, '');
        }
    };

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

    var _super_closePOS_ = module.PosWidget.prototype.close;
    module.PosWidget.prototype.close = function(){
        this.pos.prepare_text_customer_display('closePOS', {});
        return _super_closePOS_.call(this);
    };

};
