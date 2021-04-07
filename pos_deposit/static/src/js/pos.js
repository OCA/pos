/* Copyright 2021 Sunflower IT
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("pos_deposit.models", function(require) {
    "use strict";
    var models = require("point_of_sale.models");

    var pos_model_super = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        initialize: function() {
            /* Add the deposit related fields to the product model */
            var self = this;
            _.each(self.models, function(model) {
                if (model.model === "product.product") {
                    model.fields.push("select_deposit");
                    model.fields.push("use_deposit");
                    var domain_super = model.domain;
                    model.domain = function(arg) {
                        var domain = domain_super(arg);
                        domain.unshift(["is_deposit", "=", true]);
                        domain.unshift("|");
                        return domain;
                    };
                }
            });
            pos_model_super.initialize.apply(this, arguments);
        },
    });

    var order_super = models.Order.prototype;
    models.Order = models.Order.extend({
        /* Create deposit line for products with a deposit. Check if
           point_of_sale's add_product() has triggered a merge with an existing
           line, and in that case don't do anything. Otherwise, add a line
           with the deposit product. */
        add_product: function(product) {
            order_super.add_product.apply(this, arguments);

            var merged_line = null;
            this.get_orderlines().some(function(orderline) {
                // TB: merged flag is set by us
                if (orderline.merged) {
                    merged_line = orderline;
                    return true;
                }
                return false;
            });
            if (merged_line) {
                merged_line.merged = false;
            } else if (
                product.use_deposit &&
                product.select_deposit &&
                product.select_deposit[0]
            ) {
                var dep_prod = this.pos.db.get_product_by_id(product.select_deposit[0]);
                var last = this.get_last_orderline();
                var dep_line = new models.Orderline(
                    {},
                    {
                        pos: this.pos,
                        order: this,
                        product: dep_prod,
                    }
                );
                this.add_orderline(dep_line);
                dep_line.deposit_for = last;
                last.deposit_line = dep_line;
            }
        },
    });

    var order_line_super = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        merge: function() {
            /* Mark the target merge line to be picked up in our override of
               addProduct() */
            order_line_super.merge.apply(this, arguments);
            this.merged = 1;
        },
        set_quantity: function(quantity, no_propagate) {
            /* Keep quantities in sync between deposit product lines and
               lines containing the deposit */
            order_line_super.set_quantity.apply(this, arguments);
            if (!no_propagate) {
                var related = this.deposit_line || this.deposit_for;
                if (related) related.set_quantity(quantity, true);
            }
        },
    });
});
