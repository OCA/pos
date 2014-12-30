openerp.pos_payment_terminal = function(instance){
    module = instance.point_of_sale;

    module.ProxyDevice = module.ProxyDevice.extend({
        payment_terminal_transaction_start: function(line, currency_iso){
            var data = {'amount' : line.get_amount(),
                        'currency_iso' : currency_iso,
                        'payment_mode' : line.cashregister.journal.payment_mode};
//          alert(JSON.stringify(data));
            this.message('payment_terminal_transaction_start', {'payment_info' : JSON.stringify(data)});
        },
    });

    //TODO make the button bigger and with better name

    var _super_PaymentScreenWidget_init_ = module.PaymentScreenWidget.prototype.init;
    module.PaymentScreenWidget.prototype.init = function(parent, options){
        _super_PaymentScreenWidget_init_.call(this, parent, options);
        var self = this;
        this.payment_terminal_transaction_start = function(event){
            var node = this;
            while (node && !node.classList.contains('paymentline')){
                node = node.parentNode;
            }
            if (node && !_.isEmpty(node.line) && self.pos.config.iface_payment_terminal){
                self.pos.proxy.payment_terminal_transaction_start(node.line, self.pos.currency.name);
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
                var currencies = new instance.web.Model('res.currency').query(['name'])
                     .filter([['id','=',this.pos.currency.id]])
                     .all().then(function (currency) {
                    self.pos.currency.name = currency[0].name;
                });
            }
            el_node.querySelector('.payment-terminal-transaction-start')
                .addEventListener('click', this.payment_terminal_transaction_start);
        }
        return el_node;
    };

};
