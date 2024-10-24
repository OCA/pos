odoo.define("pos_event_sale.ProductInfoButton", function (require) {
    "use strict";

    const ProductInfoButton = require("point_of_sale.ProductInfoButton");
    const Registries = require("point_of_sale.Registries");

    /* eslint-disable no-shadow */
    const PosEventSaleProductInfoButton = (ProductInfoButton) =>
        class extends ProductInfoButton {
            async onClick() {
                const orderline = this.env.pos.get_order().get_selected_orderline();
                if (orderline) {
                    if (orderline.get_product().detailed_type == "event") {
                        return;
                    }
                }
                return super.onClick();
            }
        };

    Registries.Component.extend(ProductInfoButton, PosEventSaleProductInfoButton);
    return ProductInfoButton;
});
