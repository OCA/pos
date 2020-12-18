/******************************************************************************
 * Copyright (C) 2015-2016 Akretion (<http://www.akretion.com>).
 * Copyright (C) 2017-TODAY Camptocamp SA (<http://www.camptocamp.com>).
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 ******************************************************************************/

odoo.define('pos_remove_pos_category.remove_pos_category', function (require) {
    "use strict";

    var core = require('web.core');
    var pos_models = require('point_of_sale.models');
    var pos_screens = require('point_of_sale.screens');

    var _pos_super = pos_models.PosModel.prototype;
    pos_models.PosModel = pos_models.PosModel.extend({
        initialize: function(session, attributes) {
            for (var i = 0 ; i < this.models.length; i++){
                if (this.models[i].model == 'pos.category') {
                    this.models[i].model = 'product.category';
                    this.models[i].domain = [['available_in_pos', '=', true]];
                }
            }
            return _pos_super.initialize.apply(this, arguments);
        }
    });

    // override method js POS (widgets.js)
    // change pos.category by product.category
    pos_screens.ProductCategoriesWidget.include({
        get_image_url: function(category){
            var image_url = '/web/binary/image?model=product.category&field=image_medium&id=';
            return window.location.origin + image_url + category.id;
        }
    });

});
