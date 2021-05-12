odoo.define("pos_payment_method_cashdro.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");

    models.load_fields(
        "account.journal",
        ["cashdro_payment_terminal", "cashdro_host", "cashdro_user", "cashdro_password"]
    );

    var order_super = models.Order.prototype;

    models.Order = models.Order.extend({
        initialize: function(){
            order_super.initialize.apply(this, arguments);
            this.in_cashdro_transaction = false;
        },
    });

});
