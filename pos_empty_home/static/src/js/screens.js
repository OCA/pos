/*
    Copyright (C) 2017-Today: La Louve (<http://www.lalouve.net/>)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/


odoo.define('pos_empty_home.screens', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');

    screens.ProductListWidget.include({
        renderElement: function() {
            this._super();
            if (this.product_list.length == 0){
                this.el.querySelector('.product-list-empty-home').style['display'] = 'block';
            }
            else{
                this.el.querySelector('.product-list-empty-home').style['display'] = 'none';
            }
        },
    });
});
