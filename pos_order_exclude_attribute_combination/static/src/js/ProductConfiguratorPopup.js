odoo.define(
    "pos_order_exclude_attribute_combination.ProductConfiguratorPopup",
    function (require) {
        "use strict";

        const ProductConfiguratorPopup =
            require("point_of_sale.ProductConfiguratorPopup").ProductConfiguratorPopup;
        const Registries = require("point_of_sale.Registries");
        const {onMounted, useState} = owl;

        const ProductConfiguratorPopupCombination = (ProductConfiguratorPopup) =>
            class extends ProductConfiguratorPopup {
                setup() {
                    super.setup();
                    this.state = useState({
                        is_combination_possible: true,
                    });
                    onMounted(() => {
                        this.getProductCombinationInfo();
                        $(this.el)
                            .find('input[type="radio"]')
                            .on("change", () => this.getProductCombinationInfo(this));
                        $(this.el)
                            .find("select")
                            .on("change", () => this.getProductCombinationInfo(this));
                    });
                }
                async getProductCombinationInfo() {
                    var selected_attributes = [];
                    this.env.attribute_components.forEach((attribute_component) => {
                        const {selected_value} = attribute_component.state;
                        selected_attributes.push(parseFloat(selected_value));
                    });
                    await this.loadProductCombinationInfo(
                        this.props.product,
                        selected_attributes
                    );
                }
                async loadProductCombinationInfo(product, selected_attributes) {
                    const isCombinationPossible = await this.rpc({
                        model: "product.template",
                        method: "get_product_info",
                        args: [
                            [product.product_tmpl_id],
                            product.id,
                            selected_attributes,
                        ],
                    });
                    this.state.is_combination_possible = isCombinationPossible;
                }
            };

        Registries.Component.extend(
            ProductConfiguratorPopup,
            ProductConfiguratorPopupCombination
        );

        return ProductConfiguratorPopup;
    }
);
