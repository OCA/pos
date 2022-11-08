/* Copyright (C) 2014-Today Akretion (https://www.akretion.com)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Navarromiguel (https://github.com/navarromiguel)
    @author Raphaël Reverdy (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_product_template.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");
    var PosDB = require("point_of_sale.DB");

    models.PosModel.prototype.models.some(function (model) {
        if (model.model !== "product.product") {
            return false;
        }
        // Add name and product_template_attribute_value_ids to list of fields
        // to fetch for product.product
        ["name", "product_template_attribute_value_ids"].forEach(function (field) {
            if (model.fields.indexOf(field) === -1) {
                model.fields.push(field);
            }
        });
        return true; // Exit early the iteration of this.models
    });

    // Add our new models
    models.load_models([
        {
            model: "product.template",
            fields: [
                "name",
                "display_name",
                "product_variant_ids",
                "product_variant_count",
            ],
            domain: function () {
                return [
                    ["sale_ok", "=", true],
                    ["available_in_pos", "=", true],
                ];
            },
            context: function (self) {
                return {
                    pricelist: self.pricelists[0].id,
                    display_default_code: false,
                };
            },
            loaded: function (self, templates) {
                // If pos_cache
                if (Object.keys(self.db.product_by_id).length > 0) {
                    self.db.add_templates(templates);
                } else {
                    self.db.raw_templates = templates;
                }
            },
        },
        {
            model: "product.attribute",
            fields: ["name", "value_ids", "sequence"],
            loaded: function (self, attributes) {
                self.db.add_product_attributes(attributes);
            },
        },
        {
            model: "product.attribute.value",
            fields: ["name", "attribute_id"],
            loaded: function (self, values) {
                self.db.add_product_attribute_values(values);
            },
        },
        {
            model: "product.template.attribute.value",
            fields: [
                "name",
                "attribute_id",
                "product_tmpl_id",
                "product_attribute_value_id",
                "ptav_product_variant_ids",
            ],
            domain: function () {
                return [["product_tmpl_id.available_in_pos", "=", true]];
            },
            loaded: function (self, values) {
                self.db.add_product_template_attribute_values(values);
            },
        },
    ]);

    PosDB.include({
        product_search_limit: 314159265, // The maximum number of results returned by a search
        product_display_limit: 10,
        // Can't change limit because it's also used in partner search
        init: function (options) {
            this.template_by_id = {};
            this.product_attribute_by_id = {};
            this.product_attribute_value_by_id = {};
            this.product_template_attribute_value_by_id = {};
            this._super(options);
        },
        get_product_by_category: function (category_id) {
            // Change the limit only the time of the search
            this.product_display_limit = this.limit;
            this.limit = this.product_search_limit;
            var res = this._super(category_id);
            this.limit = this.product_display_limit;
            return res;
        },
        search_product_in_category: function (category_id, query) {
            // Change the limit only the time of the search
            this.product_display_limit = this.limit;
            this.limit = this.product_search_limit;
            var res = this._super(category_id, query);
            this.limit = this.product_display_limit;
            return res;
        },
        add_products: function (products) {
            this._super(products);
            // If pos_cache is also installed - then products are not available when product.templates are already loaded
            // so we have to re add them here
            if (this.raw_templates) {
                this.add_templates(this.raw_templates);
            }
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
                // Store Templates
                this.template_by_id[template.id] = template;

                // Update Product information
                var tmpl_attribute_value_ids = new Set();
                template.product_variant_ids.forEach((variant_id) => {
                    var variant = this.get_product_by_id(variant_id);
                    if (
                        variant !== undefined &&
                        variant.product_template_attribute_value_ids
                    ) {
                        variant.product_template_attribute_value_ids.forEach(
                            (tmpl_attr_value_id) => {
                                tmpl_attribute_value_ids.add(
                                    this.get_product_template_attribute_value_by_id(
                                        tmpl_attr_value_id
                                    )
                                );

                                // Add ptav
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
