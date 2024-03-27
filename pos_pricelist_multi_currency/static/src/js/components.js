odoo.define("pos_pricelist_multi_currency.components", function (require) {
    "use strict";
    const Registries = require("point_of_sale.Registries");
    var ProductItem = require("point_of_sale.ProductItem");

    const MCProductItem = (ProductItem) =>
        class extends ProductItem {
            get price() {
                const formattedUnitPrice = this.env.pos.c_format_currency(
                    this.props.product.get_display_price(this.pricelist, 1),
                    "Product Price"
                );
                if (this.props.product.to_weight) {
                    return `${formattedUnitPrice}/${
                        this.env.pos.units_by_id[this.props.product.uom_id[0]].name
                    }`;
                }
                return formattedUnitPrice;
            }
        };

    Registries.Component.extend(ProductItem, MCProductItem);
});
