/* Copyright 2026 INVITU (https://www.invitu.com)
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html). */

import {PosStore} from "@point_of_sale/app/store/pos_store";
import {isAttributeValueHidden} from "@pos_receipt_hide_attribute_no_variant/app/attribute_visibility.esm";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    getRenderedReceipt(order, title, lines, ...rest) {
        const visibleLines = lines.map((line) =>
            line.attribute_value_ids?.length
                ? {
                      ...line,
                      attribute_value_ids: line.attribute_value_ids.filter(
                          (value) =>
                              !isAttributeValueHidden(
                                  this.models,
                                  value,
                                  "pos_hide_on_kitchen_ticket"
                              )
                      ),
                  }
                : line
        );
        return super.getRenderedReceipt(order, title, visibleLines, ...rest);
    },
});
