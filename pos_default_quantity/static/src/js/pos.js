/*
  Copyright 2019 Coop IT Easy SCRLfs
    Robin Keunen <robin@coopiteasy.be>
  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define(
    'pos_default_quantity.pos_default_quantity',

    function (require) {
        "use strict";

        var models = require('point_of_sale.models');

        models.load_models({
            model: 'product.uom.categ',
            fields: ['name','pos_default_qty'],
            loaded: function (self, unit_categories) {
                self.unit_categories = unit_categories;
                var unit_categories_by_id = {};
                for (var i = 0, len = unit_categories.length; i < len; i++) {
                    unit_categories_by_id[unit_categories[i].id] = unit_categories[i]; // eslint-disable-line
                }
                self.unit_categories_by_id = unit_categories_by_id;
            },
        });

        var orderline_prototype = models.Orderline.prototype;
        models.Orderline = models.Orderline.extend({
            initialize: function (attr, options) {
                orderline_prototype.initialize.call(this, attr, options);

                // don't set default quantity on restored lines
                if (options.json) {
                    return;
                }

                var unit = this.get_unit();
                var category = (
                    this.pos
                        .unit_categories_by_id[unit.category_id[0]]);

                if (this.pos.config.set_default_product_quantity) {
                    this.set_quantity(category.pos_default_qty);
                }
            },
        });
    }
);
