/*****************************************************************************
* © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>)
*    Hendrix Costa <hendrix.costa@kmee.com.br>
*    Luiz Felipe do Divino <luiz.divino@kmee.com.br>
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
******************************************************************************/

function pos_payment_devolution_widgets(instance, module) {

    module.PaypadButtonWidget = module.PosBaseWidget.extend({
        template: 'PaypadButtonWidget',
        init: function(parent, options){
            this._super(parent, options);
            this.cashregister = options.cashregister;
        },
        renderElement: function() {
            var self = this;
            this._super();

            this.$el.click(function(){
                var currentOrder = self.pos.get('selectedOrder');

                var plines = currentOrder.get('paymentLines');

                if (self.cashregister.journal.pos_credit_analise) {
                    if(plines.length == 0){
                        if (currentOrder.attributes.client) {
                            var client = self.pos.db.get_partner_by_id(currentOrder.attributes.client.id);
                            var credit_val = client.credit_limit - (client.debit + client.credit);
                            if (credit_val > 0 && credit_val >= currentOrder.getTotalTaxIncluded()) {
                                self.pos.get('selectedOrder').addPaymentline(self.cashregister);
                                self.pos_widget.screen_selector.set_current_screen('payment');
                            } else {
                                self.pos.pos_widget.screen_selector.show_popup('error', {
                                    'message': _t('Não permitido!'),
                                    'comment': _t('Este cliente não possui limite de crédito ou o limite de crédito disponível é menor que o valor da venda.')
                                });
                            }
                        } else {
                            self.pos.pos_widget.screen_selector.show_popup('error', {
                                'message': _t('Não permitido!'),
                                'comment': _t('Está opção de pagamento não pode ser utilizada sem um cliente definido na venda.')
                            });
                        }
                    } else {
                        self.pos.pos_widget.screen_selector.show_popup('error', {
                            'message': _t('Não permitido!'),
                            'comment': _t('Está opção de pagamento não pode ser utilizada junto com outras opções.')
                        });
                    }

                } else {
                    if (plines.length){
                        // Verify if payment screen already have an credit on store payment selected
                        // Credit on store payments can not be use if others types of payments methods
                        if (!plines.models[0].cashregister.journal.pos_credit_analise) {
                            self.pos.get('selectedOrder').addPaymentline(self.cashregister);
                            self.pos_widget.screen_selector.set_current_screen('payment');
                        } else {
                            self.pos.pos_widget.screen_selector.show_popup('error', {
                                'message': _t('Não permitido!'),
                                'comment': _t('Os meios de pagamentos de creditos na loja não podem ser utilizados com outras formas de pagamento.')
                            });
                        }
                    } else {
                        self.pos.get('selectedOrder').addPaymentline(self.cashregister);
                        self.pos_widget.screen_selector.set_current_screen('payment');
                    }
                }
            });
        }
    });
}