odoo.define("pos_kiosk.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");

    const _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function (attributes, options) {
            _super_order.initialize.apply(this, arguments);
            this.client_name = options.client_name || "";
            this.vat = options.vat || "";
        },

        init_from_JSON: function (json) {
            _super_order.init_from_JSON.apply(this, arguments);
            this.client_name = json.client_name;
            this.vat = json.vat;
        },

        export_as_JSON: function () {
            const json = _super_order.export_as_JSON.apply(this, arguments);
            json.client_name = this.client_name;
            json.vat = this.vat;
            return json;
        },
    });
});
