/* Copyright 2026 INVITU (<https://www.invitu.com>)
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl) */

import {ProductConfiguratorPopup} from "@point_of_sale/app/store/product_configurator_popup/product_configurator_popup";
import {patch} from "@web/core/utils/patch";

patch(ProductConfiguratorPopup.prototype, {
    /**
     * Image of the product.product currently matching the selected
     * attribute values (this.state.product), so it updates live as the
     * cashier changes attributes. Native core only exposes an image URL
     * for the initial product (this.props.product), which never changes.
     */
    get imageUrl() {
        return this.state.product.getImageUrl();
    },
});
