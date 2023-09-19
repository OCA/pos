/*
    Copyright (C) 2023-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/

odoo.define("pos_order_new_line.Order", function (require) {
    var {Order} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    const OverloadOrder = (OriginalOrder) =>
        class extends OriginalOrder {
            constructor() {
                super(...arguments);
                this.create_new_line = false;
            }

            add_product() {
                super.add_product(...arguments);
                this.create_new_line = false;
            }
        };
    Registries.Model.extend(Order, OverloadOrder);
});
