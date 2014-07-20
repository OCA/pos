openerp.pos_payment_terminal = function(instance){
    module = instance.point_of_sale;

    module.ProxyDevice = module.ProxyDevice.extend({
        payment_terminal_transaction_start: function(line, currency_iso, currency_iso_numeric){
			var data = {'amount' : line.get_amount(),
						'currency_iso' : currency_iso,
						'currency_iso_numeric' : currency_iso_numeric,
						'payment_mode' : line.cashregister.journal.payment_mode};
//			alert(JSON.stringify(data));
			this.message('payment_terminal_transaction_start', {'payment_info' : JSON.stringify(data)});
        },
	});

	//TODO make the button bigger and with better name

    var _super_PaymentScreenWidget_init_ = module.PaymentScreenWidget.prototype.init;
    module.PaymentScreenWidget.prototype.init = function(parent, options){
        _super_PaymentScreenWidget_init_.call(this, parent, options);
		self = this;
	   this.payment_terminal_transaction_start = function(event){
			var node = this;
			while(node && !node.classList.contains('paymentline')){
				node = node.parentNode;
			}
			if(node){
				if (self.pos.config.iface_payment_terminal)
					self.pos.proxy.payment_terminal_transaction_start(node.line, self.pos.currency.name, self.pos.currency.iso_numeric);
			}
			event.stopPropagation();
		};
	};

    var _super_renderPaymentline_ = module.PaymentScreenWidget.prototype.render_paymentline;
    module.PaymentScreenWidget.prototype.render_paymentline = function(line){
        var el_node = _super_renderPaymentline_.call(this, line);
        if (line.cashregister.journal.payment_mode && this.pos.config.iface_payment_terminal){
			if (!this.pos.currency.name){
				var self = this;
				var currencies = new instance.web.Model('res.currency').query(['name', 'iso_numeric'])
					 .filter([['id','=',this.pos.currency.id]])
					 .all().then(function (currency) {
					self.pos.currency.name = currency[0].name;
					self.pos.currency.iso_numeric = currency[0].iso_numeric;
				});
			}
            el_node.querySelector('.payment-terminal-transaction-start')
						.addEventListener('click', this.payment_terminal_transaction_start);
		}
		return el_node;
    };

/*
    var _super_load_server_data_ = module.PosModel.prototype.load_server_data;
    module.PosModel.prototype.load_server_data = function(){
        var loaded = _super_load_server_data_.call(this);
		//FIXME : this is asynchronous, I can't assume the pos.currency loaded when we enter is this
		this.pos.currency.name = new instance.web.Model('res.currency').query('name').filter([['id','=',this.pos_currency.id]]).all()[0]
		return loaded;
	};
*/

/*
    var _super_setSmartStatus_ = module.ProxyStatusWidget.prototype.set_smart_status;
    module.ProxyStatusWidget.prototype.set_smart_status = function(status){
        _super_setSmartStatus_.call(this, status);
        if(status.status === 'connected'){
            var warning = false;
            var msg = ''
            if(this.pos.config.iface_customer_display){
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
*/
};
