/** @odoo-module **/

import {ProductCard} from "@point_of_sale/app/generic_components/product_card/product_card";
import {patch} from "@web/core/utils/patch";

patch(ProductCard.prototype, {
    get productColor() {
        const order = this.env.services.pos.get_order();
        return order?.isBuyProduct(this.props.productId) ? "color: purple;" : "";
    },
});
