/*
    Copyright (C) 2021 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_hide_empty_category.db", function (require) {
    "use strict";

    var PosDB = require("point_of_sale.DB");

    PosDB.include({
        get_category_childs_ids: function (categ_id) {
            const res = this.category_childs[categ_id] || [];
            return _.filter(res, (categ_id) => this.product_by_category_id[categ_id]);
        },
    });
});
