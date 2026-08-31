import {PosStore} from "@point_of_sale/app/store/pos_store";
import {patch} from "@web/core/utils/patch";
import {posConfigLogoSrc} from "@pos_config_logo/js/logo_src.esm";

patch(PosStore.prototype, {
    getReceiptHeaderData() {
        const result = super.getReceiptHeaderData(...arguments);
        const src = posConfigLogoSrc(this.config);
        if (src) {
            result.config_logo = src;
        }
        return result;
    },
});
