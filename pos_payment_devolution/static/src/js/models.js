/*****************************************************************************
* © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>)
*    Hendrix Costa <hendrix.costa@kmee.com.br>
*    Luiz Felipe do Divino <luiz.divino@kmee.com.br>
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
******************************************************************************/

function pos_payment_devolution_models(instance, module){

    var PosModelParent = module.PosModel;

    module.PosModel = module.PosModel.extend({
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
}