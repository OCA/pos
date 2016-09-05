/*****************************************************************************
* © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>)
*    Hendrix Costa <hendrix.costa@kmee.com.br>
*    Luiz Felipe do Divino <luiz.divino@kmee.com.br>
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
******************************************************************************/

function pos_payment_devolution_models(instance, module){

    var PosModelParent = module.PosModel;
    module.PosModel = module.PosModel.extend({
        /**
         * @param session
         * @param attributes
         */
        initialize: function (session, attributes) {
            PosModelParent.prototype.initialize.apply(this, arguments);

            for (var i = 0; i < this.models.length; i++){
                if (this.models[i].model == 'res.partner') {
                    this.models.splice(i, 1);
                }
            }

            this.models.push({
                model: 'res.partner',
                fields: ['name', 'cnpj_cpf', 'street', 'city', 'state_id', 'country_id', 'vat', 'phone', 'zip', 'mobile', 'email', 'ean13', 'write_date', 'credit', 'debit', 'credit_limit'],
                domain: [['customer', '=', true]],
                loaded: function (self, partners) {
                    self.partners = partners;
                    self.db.partner_by_id = [];
                    self.db.partner_sorted = [];
                    self.db.add_partners(partners);
                }
            });
        }
    });

    // var PosOrderParent = module.Order;
    // module.Order = module.Order.extend({
    //     addPaymentline: function(cashregister) {
    //         var currentOrder = this.pos.get('selectedOrder');
    //
    //         if (cashregister.journal.pos_credit_analise) {
    //             if (currentOrder.attributes.client) {
    //                 var client = this.pos.db.get_partner_by_id(currentOrder.attributes.client.id);
    //                 if (client.limit_credit > 0) {
    //                     PosOrderParent.prototype.addPaymentline.call(this, cashregister);
    //                 } else {
    //                     this.pos.pos_widget.screen_selector.show_popup('error', {
    //                         'message': _t('Não permitido!'),
    //                         'comment': _t('Este cliente não possui limite de credito.'),
    //                     });
    //                 }
    //             } else {
    //                 this.pos.pos_widget.screen_selector.show_popup('error', {
    //                     'message': _t('Não permitido!'),
    //                     'comment': _t('Está opção de pagamento não pode ser utilizada sem um cliente definido.'),
    //                 });
    //             }
    //         } else {
    //             PosOrderParent.prototype.addPaymentline.call(this, cashregister);
    //         }
    //     }
    // });
}