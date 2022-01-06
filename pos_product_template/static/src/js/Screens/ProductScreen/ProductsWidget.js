/* Copyright (C) 2014-Today Akretion (https://www.akretion.com)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Navarromiguel (https://github.com/navarromiguel)
    @author Raphaël Reverdy (https://www.akretion.com)
    @author Kevin Khao (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_product_template.ProductsWidget", function (require) {
    "use strict";

    var ProductsWidget = require("point_of_sale.ProductsWidget");
    const Registries = require("point_of_sale.Registries");
    const PosComponent = require("point_of_sale.PosComponent");
    const {useListener} = require("web.custom_hooks");

    // ProductsWidget: the whole right side of the screen (no numpad, no order recap)
    // For each product, if it is not its product template's "primary variant", hide it
    // => displays only 1 product per template

    const PPTProductsWidget = (ProductWidget) =>
        class extends ProductsWidget {
            get productsToDisplay() {
                var tmpl_seen = [];
                var res = super.productsToDisplay
                    .filter(function (product) {
                        if (tmpl_seen.indexOf(product.product_tmpl_id) === -1) {
                            tmpl_seen.push(product.product_tmpl_id);
                            return true;
                        }
                        return false;
                    })
                    .slice(0, this.env.pos.db.product_display_limit);
                return res;
            }
        };

    Registries.Component.extend(ProductsWidget, PPTProductsWidget);

    return {
        PPTProductsWidget: PPTProductsWidget,
    };
});
