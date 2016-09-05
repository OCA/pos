/*****************************************************************************
* © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>)
*    Hendrix Costa <hendrix.costa@kmee.com.br>
*    Luiz Felipe do Divino <luiz.divino@kmee.com.br>
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
******************************************************************************/

function pos_payment_devolution_widgets(instance, module) {

    module.PaypadButtonWidget = module.PosBaseWidget.extend({
        renderElement: function () {
            var self = this;
            this._super();

            this.$el.click(function () {
                self.pos.get('selectedOrder').addPaymentline(self.cashregister);
                self.pos_widget.screen_selector.set_current_screen('payment');
            });
        }
    });
}