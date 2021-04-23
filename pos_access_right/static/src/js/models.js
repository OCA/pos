odoo.define("pos_access_right.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");
    var posmodel_super = models.PosModel.prototype;

    models.PosModel = models.PosModel.extend({
        get_cashier: function () {
            const pos_cashier = posmodel_super.get_cashier.apply(this);
            const cashier = this.env.pos.users.find(
                (user) => user.id === pos_cashier.user_id[0]
            );
            pos_cashier.hasGroupPayment =
                cashier &&
                cashier.groups_id.includes(this.env.pos.config.group_payment_id[0]);
            pos_cashier.hasGroupDiscount =
                cashier &&
                cashier.groups_id.includes(this.env.pos.config.group_discount_id[0]);
            pos_cashier.hasGroupNegativeQty =
                cashier &&
                cashier.groups_id.includes(
                    this.env.pos.config.group_negative_qty_id[0]
                );
            pos_cashier.hasGroupPriceControl =
                cashier &&
                cashier.groups_id.includes(
                    this.env.pos.config.group_change_unit_price_id[0]
                );
            pos_cashier.hasGroupMultiOrder =
                cashier &&
                cashier.groups_id.includes(this.env.pos.config.group_multi_order_id[0]);
            pos_cashier.hasGroupDeleteOrder =
                cashier &&
                cashier.groups_id.includes(
                    this.env.pos.config.group_delete_order_id[0]
                );
            return pos_cashier;
        },
    });
});
