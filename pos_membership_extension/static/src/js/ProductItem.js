odoo.define("pos_membership_extension.ProductItem", function (require) {
    "use strict";

    const ProductItem = require("point_of_sale.ProductItem");
    const Registries = require("point_of_sale.Registries");

    // eslint-disable-next-line no-shadow
    const OverloadProductItem = (ProductItem) =>
        // eslint-disable-next-line no-shadow
        class OverloadProductItem extends ProductItem {
            get membership_allowed() {
                var res = this.props.product.get_membership_allowed(
                    this.env.pos.get_order().partner
                );
                return res;
            }
        };

    Registries.Component.extend(ProductItem, OverloadProductItem);

    return ProductItem;
});
