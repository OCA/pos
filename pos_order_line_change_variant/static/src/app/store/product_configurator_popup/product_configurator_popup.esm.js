/* Copyright 2026 INVITU (https://www.invitu.com)
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html). */

import {MultiProductAttribute} from "@point_of_sale/app/store/product_configurator_popup/product_configurator_popup";
import {patch} from "@web/core/utils/patch";

patch(MultiProductAttribute.prototype, {
    // Stock initAttribute() always starts unchecked, ignoring defaultValues.
    // Pre-check whatever this module put in defaultValues.multi[lineId].
    initAttribute() {
        const defaultIds =
            this.props.defaultValues?.multi?.[this.attributeLine.id] || [];
        for (const value of this.values) {
            this.state.attribute_value_ids[value.id] = defaultIds.includes(
                value.id.toString()
            );
        }
    },
});
