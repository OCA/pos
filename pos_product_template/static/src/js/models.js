/* Copyright (C) 2014-Today Akretion (https://www.akretion.com)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Navarromiguel (https://github.com/navarromiguel)
    @author Raphaël Reverdy (https://www.akretion.com)
    @author Kevin Khao (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_product_template.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");

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
            domain: function (self) {
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
                self.db.add_templates(templates);
            },
        },
        {
            model: "product.attribute",
            fields: ["name", "value_ids"],
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
            loaded: function (self, values) {
                self.db.add_product_template_attribute_values(values);
            },
        },
    ]);
});
