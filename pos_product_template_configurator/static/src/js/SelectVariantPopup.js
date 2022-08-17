odoo.define("pos_product_template_configurator.SelectVariantPopup", function (require) {
    "use strict";

    const SelectVariantPopup = require("pos_product_template.SelectVariantPopup");
    const Registries = require("point_of_sale.Registries");

    const SelectVariantPopupConfigurator = (SelectVariantPopup) =>
        class extends SelectVariantPopup {
            constructor(parent, props) {
                super(parent, props);
                if (this.env.pos.config.product_configurator) {
                    this.state.products = props.products;
                }
            }
        };

    Registries.Component.extend(SelectVariantPopup, SelectVariantPopupConfigurator);

    return {
        SelectVariantPopupConfigurator: SelectVariantPopupConfigurator,
    };
});
