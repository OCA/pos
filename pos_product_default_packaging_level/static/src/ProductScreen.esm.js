// Copyright 2026 ACSONE SA/NV
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
import {ProductCard} from "@point_of_sale/app/generic_components/product_card/product_card";
import {patch} from "@web/core/utils/patch";

patch(ProductCard.prototype, {
    setup(vals) {
        super.setup(vals);
        if (!this.from_default_level_packaging_id) {
            return;
        }
    },
    get defaultPackagingLevel() {
        return (
            Boolean(this.props.product.from_default_level_packaging_id) &&
            this.props.product.from_default_level_packaging_id
        );
    },
});
