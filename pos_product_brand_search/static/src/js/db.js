// Copyright 2025 Akretion (http://www.akretion.com).
// @author Florian Mounier <florian.mounier@akretion.com>
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

odoo.define("pos_product_brand_search.db", function (require) {
    "use strict";

    const PosDB = require("point_of_sale.DB");
    const models = require("point_of_sale.models");

    models.load_fields("product.product", ["product_brand_id"]);

    PosDB.include({
        _product_search_string: function (product) {
            let str = this._super(product);
            if (product.product_brand_id) {
                str =
                    str.replace(
                        "\n",
                        "|" + product.product_brand_id[1].replace(/[\n:]/g, "")
                    ) + "\n";
            }
            return str;
        },
    });
});
