/*****************************************************************************
* © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>)
*    Hendrix Costa <hendrix.costa@kmee.com.br>
*    Luiz Felipe do Divino <luiz.divino@kmee.com.br>
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
******************************************************************************/

function pos_payment_reconciliation_models(instance, module){

    var PosPaymentlineSuper = module.Paymentline;

    module.Paymentline = module.Paymentline.extend({
        set_payment_authorization: function(payment_authorization){
            this.payment_authorization = payment_authorization;
        },
        get_payment_authorization: function(){
            return this.payment_authorization;
        },
        set_payment_doc: function(payment_doc){
            this.payment_doc = payment_doc;
        },
        get_payment_doc: function(){
            return this.payment_doc;
        },
        set_payment_flag: function(payment_flag){
            this.payment_flag = payment_flag;
        },
        get_payment_flag: function(){
            return this.payment_flag;
        },

        export_as_JSON: function(){
            var result = PosPaymentlineSuper.prototype.export_as_JSON.call(this);
            result['note'] = this.get_payment_flag() + '/' +this.get_payment_authorization() +'/'+ this.get_payment_doc();
            return result;
        }
    });
}