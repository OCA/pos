/* License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */


odoo.define("pos_ticket_salesman_firstname.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");

    models.load_fields('res.users', ['firstname', 'lastname']);

    var _super_Order = models.Order.prototype;
    models.Order = models.Order.extend({
        export_for_printing: function() {
            var receipt = _super_Order.export_for_printing.apply(this, arguments);
            if (this.pos.config.receipt_salesman_firstname) {
                var cashier = this.pos.get_cashier();
                receipt.cashier = cashier ? cashier.firstname : null;
            }
            return receipt;
        }
    });

    return models;

});
