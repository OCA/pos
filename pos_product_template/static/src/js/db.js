/* Copyright (C) 2014-Today Akretion (https://www.akretion.com)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Navarromiguel (https://github.com/navarromiguel)
    @author Raphaël Reverdy (https://www.akretion.com)
    @author Kevin Khao (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_product_template.DB", function (require) {
    "use strict";

    var PosDB = require("point_of_sale.DB");

    PosDB.include({
        temporary_limit: 314159265, // The maximum number of results returned by a search
        // Can't change limit because it's also used in partner search
        init: function (options) {
            this.template_by_id = {};
            this.product_attribute_by_id = {};
            this.product_attribute_value_by_id = {};
            this.product_template_attribute_value_by_id = {};
            this._super(options);
        },

        get_product_by_category: function (category_id) {
            // Temporarily change the limit only for this one search
            var original_limit = this.limit;
            this.limit = this.temporary_limit;
            var res = this._super(category_id);
            this.limit = original_limit;
            return res;
        },

        search_product_in_category: function (category_id, query) {
            // Temporarily change the limit only for this one search
            var original_limit = this.limit;
            this.limit = this.temporary_limit;
            var res = this._super(category_id, query);
            this.limit = original_limit;
            return res;
        },

        get_product_template_attribute_value_by_id: function (tmpl_attribute_value_id) {
            return this.product_template_attribute_value_by_id[tmpl_attribute_value_id];
        },

        get_template_by_id: function (id) {
            return this.template_by_id[id];
        },

        add_templates: function (templates) {
            templates.forEach((template) => {
                var product_template_attribute_value_ids = [];
                this.template_by_id[template.id] = template;

                // Update Product information
                var tmpl_attribute_value_ids = new Set();
                template.product_variant_ids.forEach((variant_id) => {
                    var variant = this.get_product_by_id(variant_id);
                    if (variant != undefined) {
                        variant.product_template_attribute_value_ids.forEach(
                            (tmpl_attr_value_id) => {
                                tmpl_attribute_value_ids.add(
                                    this.get_product_template_attribute_value_by_id(
                                        tmpl_attr_value_id
                                    )
                                );
                                product_template_attribute_value_ids.push(
                                    tmpl_attr_value_id
                                );
                            }
                        );
                        variant.product_variant_count = template.product_variant_count;
                        variant.template = template;
                    }
                });

                template.product_template_attribute_value_ids = product_template_attribute_value_ids;
            });
        },

        add_product_attributes: function (product_attributes) {
            product_attributes.forEach((product_attribute) => {
                this.product_attribute_by_id[product_attribute.id] = product_attribute;
            });
        },

        add_product_attribute_values: function (product_attribute_values) {
            product_attribute_values.forEach((attribute_value) => {
                this.product_attribute_value_by_id[
                    attribute_value.id
                ] = attribute_value;
            });
        },
        add_product_template_attribute_values: function (
            product_template_attribute_values
        ) {
            product_template_attribute_values.forEach((attribute_value) => {
                this.product_template_attribute_value_by_id[
                    attribute_value.id
                ] = attribute_value;
            });
        },
    });
});
