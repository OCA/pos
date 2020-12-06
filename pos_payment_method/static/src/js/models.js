/*
    POS Payment Terminal module for Odoo
    Copyright 2018-20 ForgeFlow S.L. (https://www.forgeflow.com)
    @author: Adria Gil Sorribes (ForgeFlow)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define('pos_payment_method.models', function (require) {
    "use strict";

    var models = require('point_of_sale.models');
    var _orderproto = models.Order.prototype;

    models.load_fields('account.journal', ['use_payment_terminal']);

    models.Order = models.Order.extend({
        initialize: function(){
            _orderproto.initialize.apply(this, arguments);
            this.in_transaction = false;
        }
    });

});
