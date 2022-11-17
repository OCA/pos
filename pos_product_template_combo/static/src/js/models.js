odoo.define("pos_product_template_combo.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");
    const PosDB = require("point_of_sale.DB");

    models.load_fields("product.template", [
        "is_combo",
        "product_tmpl_combo_category_ids",
    ]);

    models.load_fields("product.product", [
        "is_combo",
        "product_tmpl_combo_category_ids",
    ]);

    models.load_models([
        {
            model: "product.template.combo.category",
            fields: [
                "name",
                "max_qty",
                "product_tmpl_combo_category_option_ids",
                "price",
                "sequence",
            ],
            loaded: function (self, combo_categories) {
                self.db.add_product_combo_categories(combo_categories);
            },
        },
        {
            model: "product.template.combo.category.option",
            fields: ["name", "product_tmpl_combo_category_id", "product_template_id"],
            loaded: function (self, combo_category_options) {
                self.db.add_product_combo_category_options(combo_category_options);
            },
        },
    ]);

    PosDB.include({
        init: function (options) {
            this.product_combo_categories_by_id = {};
            this.product_combo_category_options_by_id = {};
            this._super(options);
        },

        add_product_combo_categories: function (combo_categories) {
            combo_categories.forEach((combo_category) => {
                this.product_combo_categories_by_id[combo_category.id] = combo_category;
            });
        },

        add_product_combo_category_options: function (combo_category_options) {
            combo_category_options.forEach((combo_category_option) => {
                this.product_combo_category_options_by_id[
                    combo_category_option.id
                ] = combo_category_option;
            });
        },

        get_product_combo_categories_by_ids: function (categories_ids) {
            const categories = [];
            categories_ids.forEach((id) => {
                categories.push(this.product_combo_categories_by_id[id]);
            });
            return categories;
        },

        get_product_combo_category_options_by_ids: function (category_options_ids) {
            const category_options = [];
            category_options_ids.forEach((id) => {
                category_options.push(this.product_combo_category_options_by_id[id]);
            });
            return category_options;
        },

        get_product_by_template_id: function (template_id) {
            const template = this.get_template_by_id(template_id);
            if (template.product_variant_count === 1) {
                return this.get_product_by_id(template.product_variant_ids[0]);
            }
            return false;
        },
    });
});
