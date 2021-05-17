/*
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define('pos_payment_credit.coop_point_of_sale', function (require) {
    "use strict";

    var models = require('point_of_sale.models');

    /* ********************************************************
    Overload models.PosModel
    ******************************************************** */
    var _super_posmodel = models.PosModel.prototype;
    models.load_fields("account.journal", [
        'is_credit'
    ]);

    models.PosModel = models.PosModel.extend({
        initialize: function (session, attributes) {
            var partner_model = _.find(this.models, function(model){ return model.model === 'res.partner'; });
            partner_model.fields.push('credit_amount');
            return _super_posmodel.initialize.apply(this, arguments);
        },
    });

    models.Paymentline = models.Paymentline.extend({
        get_credit_payment: function () {
            return this.cashregister.journal.is_credit;
        },
    });
});