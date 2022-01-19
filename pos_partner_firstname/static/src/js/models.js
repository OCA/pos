odoo.define("pos_partner_firstname.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");
    models.load_fields("res.partner", ["is_company", "firstname", "lastname"]);
    return models;
});
