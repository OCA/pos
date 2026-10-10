import {PosOrderline} from "@point_of_sale/app/models/pos_order_line";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(PosOrderline.prototype, {
    _getDisplayData(val) {
        let displayData = `${val.category_id.name}`;
        if (val.message) {
            displayData += `\u2009(${val.message})`;
        }
        return displayData;
    },

    get required_identification() {
        return this.product_id.product_tmpl_category_ids.length > 0;
    },

    get required_message_identification() {
        const categories = this.product_id.product_tmpl_category_ids.map((val) =>
            this._getDisplayData(val)
        );
        return _t("Identifications:\n\u2003\u2022\u2009%(categories)s", {
            categories: categories.join("\n\u2003\u2022\u2009"),
        });
    },
});
