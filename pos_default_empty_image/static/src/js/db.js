odoo.define('pos_default_empty_image.db', function (require) {
    "use strict";

    var models = require('point_of_sale.models');

    var _super_posmodel = models.PosModel.prototype;

    // load new field 'has_image' for 'product.product' model
    models.PosModel = models.PosModel.extend({
        initialize: function (session, attributes) {
            var product_model = _.find(this.models, function(model){ return model.model === 'product.product'; });
            product_model.fields.push('has_image');

            return _super_posmodel.initialize.call(this, session, attributes);
        },
    });
});
