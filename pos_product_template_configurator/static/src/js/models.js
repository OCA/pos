odoo.define("pos_product_template_configurator.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");

    models.load_fields("product.product", ["attribute_line_ids"]);
    models.load_fields("product.attribute", ["display_type"]);
    models.load_fields("product.attribute.value", ["sequence"]);
    models.load_fields("product.template.attribute.value", [
        "price_extra",
        "html_color",
        "is_custom",
    ]);

    return models;
});
