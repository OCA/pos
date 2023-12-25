odoo.define("pos_customer_comment.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");
    models.load_fields("res.partner", ["pos_comment"]);
});
