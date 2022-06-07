odoo.define("pos_product_display_default_code.models", function (require) {
    "use strict";
    var models = require("point_of_sale.models");

    models.PosModel.prototype.models.some(function (model) {
        if (model.model !== "product.product") {
            return false;
        }
        const superContext = model.context;
        model.context = function () {
            const context = superContext.apply(this, arguments);
            context.display_default_code = true;
            return context;
        };
        return true; // Exit early the iteration of this.models
    });
});
