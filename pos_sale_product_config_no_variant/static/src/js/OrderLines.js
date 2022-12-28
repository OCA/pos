odoo.define(
    "pos_sale_product_config_no_variant.PosNoVariantOrderline",
    function (require) {
        "use strict";

        const ProductConfiguratorPopup =
            require("point_of_sale.ProductConfiguratorPopup").ProductConfiguratorPopup;
        const Registries = require("point_of_sale.Registries");
        const {useSubEnv} = owl;

        const ProductConfiguratorNoVariantPopup = (ProductConfiguratorPopup) =>
            class extends ProductConfiguratorPopup {
                setup() {
                    super.setup();
                    useSubEnv({product_no_variant_attribute_value_ids: []});
                }
                getPayload() {
                    const results = super.getPayload();
                    const product_no_variant_attribute_value_ids =
                        this.env.attribute_components.map((attribute) =>
                            parseInt(attribute.state.selected_value)
                        );
                    return Object.assign(results, {
                        product_no_variant_attribute_value_ids:
                            product_no_variant_attribute_value_ids,
                    });
                }
            };

        Registries.Component.extend(
            ProductConfiguratorPopup,
            ProductConfiguratorNoVariantPopup
        );

        return ProductConfiguratorPopup;
    }
);
