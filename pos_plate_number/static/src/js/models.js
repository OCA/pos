/*
@author: Felipe Zago <felipe.zago@kmee.com.br>
License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_plate_number.models", function (require) {
    "use strict";
    const models = require("point_of_sale.models");

    models.load_fields("pos.order", ["plate_number"]);

    const _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        init_from_JSON: function (json) {
            _super_order.init_from_JSON.apply(this, arguments);
            this.plate_number = json.plate_number;
        },

        export_as_JSON: function () {
            var res = _super_order.export_as_JSON.apply(this, arguments);
            res.plate_number = this.plate_number;
            return res;
        },
    });
});
