odoo.define("pos_product_template_configurator.ProductConfiguratorPopup", function (
    require
) {
    "use strict";

    const {
        ProductConfiguratorPopup,
        BaseProductAttribute,
    } = require("point_of_sale.ProductConfiguratorPopup");
    const {patch} = require("web.utils");

    patch(
        ProductConfiguratorPopup,
        "pos_product_template_configurator.ProductConfiguratorPopup",
        {
            getPayload() {
                // Override method to add id for selected attribute
                var selected_attributes = [];
                var selected_attribute_value_ids = [];
                var price_extra = 0.0;

                this.env.attribute_components.forEach((attribute_component) => {
                    const {value, extra, id} = attribute_component.getValue();
                    selected_attribute_value_ids.push(id);
                    selected_attributes.push(value);
                    price_extra += extra;
                });

                return {
                    selected_attributes,
                    selected_attribute_value_ids,
                    price_extra,
                };
            },
        }
    );

    patch(
        BaseProductAttribute,
        "pos_product_template_configurator.BaseProductAttribute",
        {
            getValue() {
                // Override method to add id for selected attribute values
                var result = this._super();
                const selected_value = this.values.find(
                    (val) => val.id === parseFloat(this.state.selected_value)
                );
                result.id = selected_value.id;
                return result;
            },
        }
    );
});
