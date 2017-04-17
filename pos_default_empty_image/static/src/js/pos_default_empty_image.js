odoo.define('pos_default_empty_image', function (require) {
"use strict";

    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');

    //don't try to get an image if we know the product ain't one
    var ProductListImageWidget = screens.ProductListWidget.include({
        get_product_image_url: function(product){
            if (product.has_image)
                return this._super(product);

            return '/web/static/src/img/placeholder.png';
        }
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
