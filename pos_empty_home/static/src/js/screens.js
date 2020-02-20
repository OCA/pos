/*
    Copyright (C) 2017-Today: La Louve (<http://www.lalouve.net/>)
    Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/


odoo.define('pos_empty_home.screens', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');

    screens.ProductListWidget.include({
        set_product_list: function(product_list){
            this._super(product_list);
            if (product_list.length) {
               $(this.el.querySelector('.product-list-empty-home')).hide();
            } else {
                $(this.el.querySelector('.product-list-empty-home')).show();
            }
        },
    });

    return screens;
});
