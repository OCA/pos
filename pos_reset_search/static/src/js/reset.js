odoo.define('product_click_search_reset', function (require) {
    "use strict";
    var screens = require('point_of_sale.screens');

    screens.ProductScreenWidget.include({
        click_product: function (product) {
            var self = this;
            self._super(product);
            self.product_categories_widget.clear_search();
        },
    });
});
