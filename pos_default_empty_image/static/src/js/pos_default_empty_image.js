odoo.define('pos_default_empty_image', function (require) {
    "use strict";

    var models = require('point_of_sale.models');
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
                var cached = this.product_cache.get_node(product.id);
                if(!cached){
                    var image_url = this.get_product_image_url(product);
                    var product_html = QWeb.render('ProductNoImage',{
                        widget:  this,
                        product: product,
                    });
                    var product_node = document.createElement('div');
                    product_node.innerHTML = product_html;
                    product_node = product_node.childNodes[1];
                    this.product_cache.cache_node(product.id,product_node);
                    return product_node;
                }
                return cached;
            }
        },
    });

    var _super_posmodel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        initialize: function (session, attributes) {
            var product_model = _.find(this.models, function(model){ return model.model === 'product.product'; });
            product_model.fields.push('has_image');

            return _super_posmodel.initialize.call(this, session, attributes);
        },
    });
});
