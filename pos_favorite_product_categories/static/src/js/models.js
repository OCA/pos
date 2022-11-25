odoo.define("pos_favorite_product_categories.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");

    models.load_fields("pos.category", ["favorite", "only_favorite_bar"]);
});
