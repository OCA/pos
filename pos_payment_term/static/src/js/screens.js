/*****************************************************************************
* © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>)
*    Luiz Felipe do Divino <luiz.divino@kmee.com.br>
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
******************************************************************************/

function pos_payment_term_screens(instance, module) {

    module.PaymentScreenWidget = module.PaymentScreenWidget.extend({
        validate_order: function(options) {
            this._super(options);

            var currentOrder = this.pos.get('selectedOrder');
            currentOrder.attributes.payment_term_id = $(".paymentline-input").val();
        }
     });

 }