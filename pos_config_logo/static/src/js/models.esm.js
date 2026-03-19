import {PosStore} from "@point_of_sale/app/store/pos_store";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    getReceiptHeaderData() {
        const result = super.getReceiptHeaderData(...arguments);
        if (this.config.logo) {
            result.config_logo = `${this.session._base_url}/web/image?model=pos.config&id=${this.config.id}&field=logo`;
        }
        return result;
    },
});
