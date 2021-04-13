/* Copyright (C) 2014-Today Akretion (https://www.akretion.com)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Navarromiguel (https://github.com/navarromiguel)
    @author Raphaël Reverdy (https://www.akretion.com)
    @author Kevin Khao (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_product_template.ProductTemplateItem", function (require) {
    "use strict";

    var ProductItem = require("point_of_sale.ProductItem");
    const Registries = require("point_of_sale.Registries");

    // Monkeypatch ProductItem to render ProductTemplateItem when appropriate

    const ProductTemplateItem = (ProductItem) =>
        class extends ProductItem {
            constructor(parent, props) {
                super(parent, props);
                // Guard to avoid infinite recursion
                if (props.forceVariant) {
                } else if (props.product.product_variant_count > 1) {
                    var qweb = this.env.qweb;
                    this.__owl__.renderFn = qweb.render.bind(
                        qweb,
                        "ProductTemplateItem"
                    );
                }
            }
        };

    Registries.Component.extend(ProductItem, ProductTemplateItem);

    return {
        ProductTemplateItem: ProductTemplateItem,
    };
});
