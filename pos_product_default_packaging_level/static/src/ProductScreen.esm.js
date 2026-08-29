// Copyright 2026 ACSONE SA/NV
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
import {ProductCard} from "@point_of_sale/app/generic_components/product_card/product_card";
import {ProductProduct} from "@point_of_sale/app/models/product_product";
import {patch} from "@web/core/utils/patch";

patch(ProductCard.prototype, {
    setup(vals) {
        super.setup(vals);
        if (!this.from_default_level_packaging_id) {
            return;
        }
    },
    get multiDefaultPackagingLevel() {
        return (
            Boolean(this.props.product.variants) &&
            Boolean(this.props.product.variants.length > 1) &&
            Boolean(this.props.product.from_default_level_packaging_id) &&
            this.props.product.from_default_level_packaging_id
        );
    },
    get defaultPackagingLevel() {
        return (
            Boolean(this.props.product.from_default_level_packaging_id) &&
            this.props.product.from_default_level_packaging_id
        );
    },
});

patch(ProductProduct.prototype, {
    get defaultPackagingLevel() {
        return this.from_default_level_packaging_id
            ? this.from_default_level_packaging_id.name
            : this.uom_id.name;
    },
});
