/*****************************************************************************
* © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>)
*    Hendrix Costa <hendrix.costa@kmee.com.br>
*    Luiz Felipe do Divino <luiz.divino@kmee.com.br>
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
******************************************************************************/

openerp.pos_payment_reconciliation = function (instance) {
    var module = instance.point_of_sale;
    pos_payment_reconciliation_models(instance, module);
    pos_payment_reconciliation_screens(instance, module);
};
