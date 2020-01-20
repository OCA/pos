odoo.define('pos_accented_search', function (require) {

    "use strict";
     var db = require("point_of_sale.DB");
     db.include({

        remove_accented_characters: function(product){
            return product.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\u0152-\u0153]/g, "oe")
        },

        _product_search_string: function(product){
            return this.remove_accented_characters(this._super(product));
        },

        search_product_in_category: function(category_id, query){
            return this._super(category_id, this.remove_accented_characters(query))
        }
     });

     return db;

});
