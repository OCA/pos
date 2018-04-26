/*****************************************************************************
* © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>)
*    Luiz Felipe do Divino <luiz.divino@kmee.com.br>
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
******************************************************************************/

function pos_payment_term_models(instance, module){

    var PosModelParent = module.PosModel;
    module.PosModel = module.PosModel.extend({
        initialize: function (session, attributes) {
            PosModelParent.prototype.initialize.apply(this, arguments);
            this.models.push({
                model:  'account.payment.term',
                fields: ['name', 'note'],
                loaded: function(self,payment_terms){
                    self.payment_terms = payment_terms;
                }
            });
        }
    });

    module.Paymentline = module.Paymentline.extend({
        set_payment_term: function(payment_term){
            this.payment_term = payment_term;
        },
        get_payment_term: function(){
            return this.payment_term;
        },
        export_as_JSON: function(){
            return {
                name: instance.web.datetime_to_str(new Date()),
                statement_id: this.cashregister.id,
                account_id: this.cashregister.account_id[0],
                journal_id: this.cashregister.journal_id[0],
                amount: this.get_amount(),
                payment_term: this.get_payment_term()
            };
        }
    });
}