/*****************************************************************************
* © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>)
*    Hendrix Costa <hendrix.costa@kmee.com.br>
*    Luiz Felipe do Divino <luiz.divino@kmee.com.br>
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
******************************************************************************/

function pos_payment_reconciliation_screens(instance, module) {

    module.PaymentScreenWidget = module.PaymentScreenWidget.extend({
        bind_events: function() {
            if(this.old_order){
                this.old_order.unbind(null,null,this);
            }
            var order = this.pos.get('selectedOrder');
                order.bind('change:selected_paymentline',this.focus_selected_line,this);

            this.old_order = order;

            if(this.old_paymentlines){
                this.old_paymentlines.unbind(null,null,this);
            }
            var paymentlines = order.get('paymentLines');
                paymentlines.bind('add', this.add_paymentline, this);
                paymentlines.bind('change:amount', function(line){
                        if(!line.selected && line.node){
                            line.node.value = line.amount.toFixed(this.pos.currency.decimals);
                        }
                        this.update_payment_summary();
                    },this);
                paymentlines.bind('change:amount', function(line){
                        if(!line.selected && line.node){
                            line.node.value = line.amount.toFixed(this.pos.currency.decimals);
                        }
                        this.update_payment_summary();
                    },this);
                paymentlines.bind('remove', this.remove_paymentline, this);
                paymentlines.bind('all', this.update_payment_summary, this);

            this.old_paymentlines = paymentlines;

            if(this.old_orderlines){
                this.old_orderlines.unbind(null,null,this);
            }
            var orderlines = order.get('orderLines');
                orderlines.bind('all', this.update_payment_summary, this);

            this.old_orderlines = orderlines;
        },
        validate_order: function(options) {

            var currentOrder = this.pos.get('selectedOrder');

            var plines = currentOrder.get('paymentLines').models;

            var payment_authorization_lines = [];
            this.$('.payment-authorization').each(function(){
                payment_authorization_lines.push(this.value);
            });
            var payment_doc_lines = [];
            this.$('.payment-doc').each(function(){
                payment_doc_lines.push(this.value);
            });
            var payment_flag_lines = [];
            this.$('.payment-flag').each(function(){
                payment_flag_lines.push(this.value);
            });

            for (var i = 0; i < plines.length; i++) {
                plines[i].set_payment_authorization(payment_authorization_lines[i]);
                plines[i].set_payment_doc(payment_doc_lines[i]);
                plines[i].set_payment_flag(payment_flag_lines[i]);
            }

            this._super();

        }
     });

 }