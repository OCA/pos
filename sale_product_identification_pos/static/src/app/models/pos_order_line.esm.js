import {PosOrderline} from "@point_of_sale/app/models/pos_order_line";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(PosOrderline.prototype, {
    async setup() {
        await super.setup(...arguments);
    },

    _getDisplayData(val) {
        let displayData = `${val.category_id.name}`;
        if (val.message) {
            displayData += `\u2009(${val.message})`;
        }
        return displayData;
    },

    getDisplayData() {
        var data = super.getDisplayData();
        var self = this;
        data.required_identification =
            this.product_id.product_tmpl_category_ids.length > 0;
        const categories = this.product_id.product_tmpl_category_ids.map((val) =>
            self._getDisplayData(val)
        );
        data.required_message_identification = _t(
            "Identifications:\n\u2003\u2022\u2009%(categories)s",
            {
                categories: categories.join("\n\u2003\u2022\u2009"),
            }
        );
        return data;
    },
});
