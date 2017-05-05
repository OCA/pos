/*
    Copyright (C) 2017-Today: La Louve (<http://www.lalouve.net/>)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/


odoo.define('pos_empty_home.db', function (require) {
    "use strict";

    var PosDB = require('point_of_sale.DB');

    PosDB.include({
        get_product_by_category: function(category_id){
            console.log(this.config);
            if (category_id != 0){
                return this._super(category_id);
            }
            else{
                return [];
            }
        },
    });
});
