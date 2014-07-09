openerp.pos_customer_display = function(instance){
    module = instance.point_of_sale;

    var _t = instance.web._t;
    var round_di = instance.web.round_decimals;
    var round_pr = instance.web.round_precision


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
				var price_unit = line.get_quantity() * line.get_unit_price() * (1.0 - (line.get_discount() / 100.0));
				price_unit = price_unit.toFixed(currency_rounding);
				var l21 = line.get_quantity_str_with_unit() + ' x ' + price_unit;
				var l22 = ' ' + line.get_display_price().toFixed(currency_rounding);
				var lines_to_send = new Array(
								 this.proxy.complete_string_right(line.get_product().name, line_length),
								 this.proxy.complete_string_right(l21, line_length - l22.length) + l22
								 );
			} else if (type == 'removeOrderline') {
				// FIXME : first click on the backspace button set the amount to 0
				var line = data['line'];
				var price_unit = line.get_quantity() * line.get_unit_price() * (1.0 - (line.get_discount() / 100.0));
				price_unit = price_unit.toFixed(currency_rounding);
				var l21 = '-' + line.get_quantity_str_with_unit() + ' x ' + price_unit;
				var l22 = ' ' + -1 * line.get_display_price().toFixed(currency_rounding);
				var lines_to_send = new Array(
								 this.proxy.complete_string_right(line.get_product().name, line_length),
								 this.proxy.complete_string_right(l21, line_length - l22.length) + l22
								 );
			} else if (type == 'addPaymentline') {
				var cashregister = data['cashregister'];
				var total = this.get('selectedOrder').getTotalTaxIncluded().toFixed(currency_rounding);
				var lines_to_send = new Array(
								 this.proxy.complete_string_right(_t("TOTAL : "), line_length - 1 - total.length) + ' ' + total,
								 this.proxy.complete_string_right(_t("Paiement :"), line_length - 1 - cashregister.journal_id[1].length) + ' ' + cashregister.journal_id[1]
								 );
		
			} else if (type == 'removePaymentline') {
				var line = data['line'];
				var amount = line.get_amount().toFixed(currency_rounding);
				var lines_to_send = new Array(
								 this.proxy.complete_string_right(_t("Suppression paiement"), line_length),
								 this.proxy.complete_string_right(line.cashregister.journal_id[1] , line_length - 1- amount.length) + ' ' + amount
								 );
			} else if (type == 'pushOrder') {
				var currentOrder = data['currentOrder'];
				var paidTotal = currentOrder.getPaidTotal();
				var dueTotal = currentOrder.getTotalTaxIncluded();
				var remaining = dueTotal > paidTotal ? dueTotal - paidTotal : 0;
				var change = paidTotal > dueTotal ? paidTotal - dueTotal : 0;

				var l1;
				if (change == 0){
					l1 = this.proxy.complete_string_center(_t(""), line_length);
				} else {
					change = change.toFixed(currency_rounding);
					l1 = this.proxy.complete_string_right(_t("YOUR CHANGE :"), line_length - 1 - change.length) + ' ' + change;
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

			this.proxy.send_text_customer_display(lines_to_send, line_length);
		},

	});


    module.ProxyDevice = module.ProxyDevice.extend({
        send_text_customer_display: function(data, line_length){
            if (data[0].length != line_length || data[1].length != line_length){
                console.warn("Data components have to have " + line_length + " chars.");
                console.log(data[0].length + " -> "+ data[0] + "\n" + data[1].length + " -> " + data[1]);
            } else {
				//alert(JSON.stringify(data));
				return this.message('send_text_customer_display', {'text_to_display' : JSON.stringify(data)});
			}
			return;
        },
        complete_string_right: function(string, length){
               if (string.length > length)
               {
                    return string.substring(0,length);
               }
               else if (string.length < length)
               {
                    while(string.length < length)
                         string = string+' ';
                    return string;
               }
               return string;
        },
       complete_string_left: function(string, length){
             if (string.length > length)
             {
                    return string.substring(0,length);
             }
             else if (string.length < length)
             {
                    while(string.length < length)
                          string = ' '+string;
                    return string;
             }
             return string;
       },
       complete_string_center: function(string, length){
			 var self = this;
             if (string.length > length)
             {
                    return string.substring(0,length);
             }
             else if (string.length < length)
             {
					ini = (length - string.length)/2;
                    while(string.length < length - ini)
                          string = ' '+string;
                    while(string.length < length)
                          string = string + ' ';
					return string;
             }
             return string;
       },
    });     


    var _super_setSmartStatus_ = module.ProxyStatusWidget.prototype.set_smart_status;
    module.ProxyStatusWidget.prototype.set_smart_status = function(status){
        _super_setSmartStatus_.call(this, status);
		if(status.status === 'connected'){
			var warning = false;
			var msg = ''
			if( this.pos.config.iface_customer_display){
				var customer_display = status.drivers.customer_display ? status.drivers.customer_display.status : false;
				if( customer_display != 'connected' && customer_display != 'connecting'){
					warning = true;
					msg = msg ? msg + ' & ' : msg;
					msg += _t('Customer display');
				}
			}       
			msg = msg ? msg + ' ' + _t('Offline') : msg;
			this.set_status(warning ? 'warning' : 'connected', msg);
		}else{  
			this.set_status(status.status,'');
		}
    };
             

    var _super_addProduct_ = module.Order.prototype.addProduct;
    module.Order.prototype.addProduct = function(product, options){
        _super_addProduct_.call(this, product, options);
		this.pos.prepare_text_customer_display('addProduct', {'product' : product, 'options' : options}); 
    };

        
    var _super_removeOrderline_ = module.Order.prototype.removeOrderline;
    module.Order.prototype.removeOrderline = function(line){
		this.pos.prepare_text_customer_display('removeOrderline', {'line' : line});
        _super_removeOrderline_.call(this, line);
    };

    var _super_removePaymentline_ = module.Order.prototype.removePaymentline;
    module.Order.prototype.removePaymentline = function(line){
		this.pos.prepare_text_customer_display('removePaymentline', {'line' : line});
        _super_removePaymentline_.call(this, line);
    };

    var _super_addPaymentline_ = module.Order.prototype.addPaymentline;
    module.Order.prototype.addPaymentline = function(cashregister){
        _super_addPaymentline_.call(this, cashregister);
		this.pos.prepare_text_customer_display('addPaymentline', {'cashregister' : cashregister});
    };


    var _super_pushOrder_ = module.PosModel.prototype.push_order;
    module.PosModel.prototype.push_order = function(currentOrder){
        _super_pushOrder_.call(this, currentOrder);
		this.prepare_text_customer_display('pushOrder', {'currentOrder' : currentOrder});

    };


    var _super_closePOS_ = module.PosWidget.prototype.close;
    module.PosWidget.prototype.close = function(){
        this.pos.prepare_text_customer_display('closePOS', {});
        _super_closePOS_.call(this);
    };

/*
    var _super_updatePayment_ = module.PaymentScreenWidget.prototype.update_payment_summary;
    module.PaymentScreenWidget.prototype.update_payment_summary = function(){
        _super_updatePayement_.call(this);
        if( this.pos.config.iface_customer_display != true )
            return;
		var currentOrder = this.pos.get('selectedOrder');
		var paidTotal = currentOrder.getPaidTotal();
		var dueTotal = currentOrder.getTotalTaxIncluded();
		var remaining = dueTotal > paidTotal ? dueTotal - paidTotal : 0;
		var change = paidTotal > dueTotal ? paidTotal - dueTotal : 0;

        var currency_rounding = Math.ceil(Math.log(1.0 / this.pos.currency.rounding) / Math.log(10));
        var amount = line.get_amount().toFixed(currency_rounding);
        var line_length = this.pos.config.customer_display_line_length || 20;
        var data = new Array(
                         this.pos.proxy.complete_string_right(_t("Suppression paiement"), line_length),
                         this.pos.proxy.complete_string_right(line.cashregister.journal_id[1] , line_length - amount.length) + ' ' + amount
                         );
        this.pos.proxy.send_text_customer_display(data);
    };
*/
/*
    module.Paymentline = module.Paymentline.extend({
        set_pos: function(pos){
            this.pos = pos;
        },
    });     

    module.PaypadButtonWidget = module.PaypadButtonWidget.extend({
        renderElement: function() {
               var self = this;
               this._super();

               this.$el.click(function(){
                    if (self.pos.get('selectedOrder').get('screen') === 'receipt'){  //TODO Why ?
                         console.warn('TODO should not get there...?');
                         return;
                    }
                    self.pos.get('selectedOrder').addPaymentline(self.cashregister);
                    console.log('aurel');
                    self.pos.get('selectedOrder').get('paymentLines').at(self.pos.get('selectedOrder').get('paymentLines').length -1).set_pos(self.pos);
                    console.log('aurel');
                    self.pos_widget.screen_selector.set_current_screen('payment');
               });
          },
    });

    var _super_setamountPaymentline_ = module.Paymentline.prototype.set_amount;
    module.Paymentline.prototype.set_amount = function(amount){
        _super_setamountPaymentline_.call(this, amount);
          var data = _t("Add paymentline : ") + this.cashregister.journal_id[1] + " " + this.get_amount()      + " " + this.pos.get('selectedOrder').getDueLeft();
        alert(data);
          this.pos.proxy.send_text_customer_display(data);
    };
*/
};
