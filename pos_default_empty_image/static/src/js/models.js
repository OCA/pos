odoo.define('pos_default_empty_image.db', function (require) {
    "use strict";

    var models = require('point_of_sale.models');

    // load new field 'has_image' for 'product.product' model
    models.load_fields("product.product", ['has_image']);
});
