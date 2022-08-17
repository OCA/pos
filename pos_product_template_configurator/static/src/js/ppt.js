odoo.define("pos_product_template_configurator.pos_product_template", function (
    require
) {
    "use strict";

    var ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const PPTConfiguratorProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            async _clickProductTemplate(event) {
                if (this.env.pos.config.product_configurator) {
                    var product = event.detail;
                    var ptav = Array.from(
                        new Set(
                            product.template.product_template_attribute_value_ids.map(
                                (x) =>
                                    this.env.pos.db.get_product_template_attribute_value_by_id(
                                        x
                                    )
                            )
                        )
                    );
                    var attributes_by_id = {};
                    ptav.forEach((x) => {
                        var id = x.attribute_id[0];
                        attributes_by_id[id] = attributes_by_id[id] || {
                            attribute: x.attribute_id,
                            values: {},
                            ptav: {},
                        };
                        attributes_by_id[id].ptav[x.id] = x;
                    });
                    var product_attribute_by_id = this.env.pos.db
                        .product_attribute_by_id;
                    var product_attribute_value_by_id = this.env.pos.db
                        .product_attribute_value_by_id;
                    var attributes = Object.values(attributes_by_id).map((x) => {
                        return _.extend({}, product_attribute_by_id[x.attribute[0]], {
                            values: _.sortBy(
                                Object.values(x.ptav),
                                (item) =>
                                    product_attribute_value_by_id[
                                        item.product_attribute_value_id[0]
                                    ].sequence
                            ),
                        });
                    });
                    const {confirmed, payload} = await this.showPopup(
                        "ProductConfiguratorPopup",
                        {
                            product: product.template,
                            attributes: attributes,
                        }
                    );

                    if (confirmed) {
                        var selected_attribute_values = ptav.filter((x) =>
                            payload.selected_attribute_value_ids.includes(x.id)
                        );
                        const products = this.get_products_by_attribute_values(
                            selected_attribute_values
                        );
                        if (products.length) {
                            if (products.length === 1) {
                                // Add product to card
                                this._clickProduct({detail: products[0]});
                            } else {
                                var ret = await this.showPopup("SelectVariantPopup", {
                                    template_id: product.product_tmpl_id,
                                    products: products,
                                });

                                if (ret.confirmed)
                                    return this._clickProduct({detail: ret.payload});
                            }
                        } else {
                            this.showPopup("ErrorPopup", {
                                title: this.env._t("Product not found."),
                                body: this.env._t(
                                    "Product not found for the selected attribute values."
                                ),
                            });
                        }
                    } else {
                        return;
                    }
                } else {
                    return super._clickProductTemplate(event);
                }
            }
            get_products_by_attribute_values(attribute_values) {
                function intersection(setA, setB) {
                    var intersection = new Set();
                    for (var elem of setB) {
                        if (setA.has(elem)) {
                            intersection.add(elem);
                        }
                    }
                    return intersection;
                }
                var variants_ids = attribute_values
                    .map((ptav) => {
                        return new Set(ptav.ptav_product_variant_ids);
                    })
                    .reduce((a, b) => {
                        return intersection(a, b);
                    });
                return Array.from(variants_ids).map((x) => {
                    return this.env.pos.db.get_product_by_id(x);
                });
            }
        };

    Registries.Component.extend(ProductScreen, PPTConfiguratorProductScreen);

    return {
        PPTConfiguratorProductScreen: PPTConfiguratorProductScreen,
    };
});
