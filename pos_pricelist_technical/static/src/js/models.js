/**
Copyright (C) 2022 - Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**/

odoo.define("pos_pricelist_technical.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");

    models.load_fields("product.pricelist", ["is_technical"]);

});
