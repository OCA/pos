/*
Copyright (C) 2024-Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_restaurant_receipt_usability.models", function (require) {
    "use strict";

    const {Order} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    const OverloadOrder = (OriginalOrder) =>
        class extends OriginalOrder {
            constructor() {
                super(...arguments);
                this.splitted_order = false;
            }
        };
    Registries.Model.extend(Order, OverloadOrder);

    return Order;
});
