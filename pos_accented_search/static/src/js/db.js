odoo.define('pos_accented_search', function (require) {

    "use strict";
    var db = require("point_of_sale.DB");
    db.include({

        normalize_characters: function (product) {
            // The normalization extract out combining diacritical marks
            // All those diacritics in range [\u0300-\u036f].
            // See https://en.wikipedia.org/wiki/Combining_Diacritical_Marks.
            // All the diacritics are removed by the code below.
            return product.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[\u0152-\u0153]/g, "oe");
        },

        _product_search_string: function (product) {
            return this.normalize_characters(this._super(product));
        },

        search_product_in_category: function (category_id, query) {
            return this._super(category_id, this.normalize_characters(query));
        },
    });

    return db;

});

