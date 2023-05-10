odoo.define("pos_partner_birthdate.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");
    models.load_fields("res.partner", ["birthdate_date"]);
});
