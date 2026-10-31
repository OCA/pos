/* Copyright 2026 INVITU (https://www.invitu.com)
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html). */

import {PosOrderline} from "@point_of_sale/app/models/pos_order_line";
import {constructFullProductName} from "@point_of_sale/utils";
import {isAttributeValueHidden} from "@pos_receipt_hide_attribute_no_variant/app/attribute_visibility.esm";
import {patch} from "@web/core/utils/patch";

patch(PosOrderline.prototype, {
    getReceiptProductName() {
        const values = this.attribute_value_ids.filter(
            (value) =>
                !isAttributeValueHidden(this.models, value, "pos_hide_on_receipt")
        );
        if (values.length === this.attribute_value_ids.length) {
            return this.get_full_product_name();
        }
        return constructFullProductName({
            product_id: this.product_id,
            attribute_value_ids: values,
            custom_attribute_value_ids: this.custom_attribute_value_ids,
        });
    },
});
