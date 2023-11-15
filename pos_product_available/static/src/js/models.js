odoo.define("pos_product_available.models", function (require) {
    "use strict";
    var models = require("point_of_sale.models");

    models.PosModel.prototype.models.some(function (model) {
        if (model.model !== "product.product") {
            return false;
        }
        model.domain = function (self) {
            var domain = [
                "&",
                "&",
                ["sale_ok", "=", true],
                ["available_in_pos", "=", true],
                "|",
                ["company_id", "=", self.config.company_id[0]],
                ["company_id", "=", false]
            ];
            if (
                self.config.limit_categories &&
                self.config.iface_available_categ_ids.length
            ) {
                domain.unshift("&");
                domain.push([
                    "pos_categ_id",
                    "in",
                    self.config.iface_available_categ_ids
                ]);
                if (
                    self.config.available_product &&
                    self.config.available_product_ids.length
                ) {
                    domain.unshift("&");
                    domain.push([
                        "product_tmpl_id",
                        "in",
                        self.config.available_product_ids
                    ]);
                }
            }
            if (self.config.iface_tipproduct) {
                domain.unshift(["id", "=", self.config.tip_product_id[0]]);
                domain.unshift("|");
            }
            return domain;
        };
        return true;
    });
});
