odoo.define('pos_default_empty_image.widgets', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');

    var core = require('web.core');

    var QWeb = core.qweb;

    //don't try to get an image if we know the product ain't one
    var ProductListImageWidget = screens.ProductListWidget.include({
        get_product_image_url: function(product){
            if (product.has_image)
                return this._super(product);
        },

        // Change product display if product has no image;
        render_product: function(product){
            if (product.has_image){
                return this._super(product);
            }
            else {
                var current_pricelist = this._get_active_pricelist();
                var cache_key = this.calculate_cache_key(product, current_pricelist);
                var cached = this.product_cache.get_node(cache_key);
                if(!cached){
                    var product_html = QWeb.render('ProductNoImage',{
                        widget:  this,
                        product: product,
                        pricelist: current_pricelist,
                    });
                    var product_node = document.createElement('div');
                    product_node.innerHTML = product_html;
                    product_node = product_node.childNodes[1];
                    this.product_cache.cache_node(cache_key,product_node);
                    return product_node;
                }
                return cached;
            }
        },
    });
});
