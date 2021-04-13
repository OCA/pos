/* Copyright (C) 2014-Today Akretion (https://www.akretion.com)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Navarromiguel (https://github.com/navarromiguel)
    @author Raphaël Reverdy (https://www.akretion.com)
    @author Kevin Khao (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_product_template.ProductScreen", function (require) {
    "use strict";

    var ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");
    const {useListener} = require("web.custom_hooks");

    // ProductScreen encompasses the whole screen except for the pink top header
    // The following adds onclick on product template to display SelectVariantPopup

    const PPTProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            constructor(parent, props) {
                super(parent, props);
                useListener("click-product-template", this._clickProductTemplate);
            }

            async _clickProductTemplate(event) {
                var template = event.detail.template;
                var products = {};
                for (const product_id of template.product_variant_ids) {
                    products[product_id] = this.env.pos.db.product_by_id[product_id];
                }
                var ptavs = Object.values(
                    this.env.pos.db.product_template_attribute_value_by_id
                ).filter(function (ptav) {
                    return ptav.product_tmpl_id[0] === template.id;
                });
                var attribute_ids = new Set();
                var attributes = [];
                for (const ptav of ptavs) {
                    attribute_ids.add(ptav.attribute_id[0]);
                }
                for (const attribute_id of attribute_ids) {
                    attributes.push(
                        this.env.pos.db.product_attribute_by_id[attribute_id]
                    );
                }
                var ret = await this.showPopup("SelectVariantPopup", {
                    config: {
                        product_attribute_by_id: this.env.pos.db
                            .product_attribute_by_id,
                        attributes: attributes,
                        ptavs: ptavs,
                        products: products,
                        template: template,
                        selectors: [],
                        idx_final_level: attributes.length - 1,
                    },
                });
                if (ret.confirmed) return this._clickProduct({detail: ret.payload});
            }
        };

    Registries.Component.extend(ProductScreen, PPTProductScreen);

    return {
        PPTProductScreen: PPTProductScreen,
    };
});
