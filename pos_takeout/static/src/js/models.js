/** ****************************************************************************
    # Copyright 2023 KMEE INFORMATICA LTDA (http://www.kmee.com.br).
    @author: Felipe Zago Rodrigues <felipe.zago@kmee.com.br>
    License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
 *****************************************************************************/

odoo.define("pos_takeout.models", function (require) {
    "use strict";
    const models = require("point_of_sale.models");

    models.load_fields("pos.order", ["eat_here"]);

    const _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function () {
            _super_order.initialize.apply(this, arguments);
            this.eat_here = this.eat_here || true;
        },

        init_from_JSON: function (json) {
            _super_order.init_from_JSON.apply(this, arguments);
            this.eat_here = json.eat_here;
        },

        export_as_JSON: function () {
            var res = _super_order.export_as_JSON.apply(this, arguments);
            res.eat_here = this.eat_here;
            return res;
        },
    });
});
