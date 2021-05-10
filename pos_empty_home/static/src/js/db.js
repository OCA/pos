/*
    Copyright (C) 2017-Today: La Louve (<http://www.lalouve.net/>)
    Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_empty_home.db", function(require) {
    "use strict";

    var PosDB = require("point_of_sale.DB");

    PosDB.include({
        get_product_by_category: function(category_id) {
            if (window.posmodel.config.iface_empty_home && category_id == 0) {
                return [];
            }
            return this._super.apply(this, arguments);
        },
    });

    return PosDB;
});
