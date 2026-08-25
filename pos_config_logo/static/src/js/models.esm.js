import {PosConfig} from "@point_of_sale/app/models/pos_config";
import {patch} from "@web/core/utils/patch";
import {imageUrl} from "@web/core/utils/urls";

patch(PosConfig.prototype, {
    get receiptLogoUrl() {
        if (this.raw.logo) {
            return imageUrl("pos.config", this.id, "logo", {width: 256, height: 256});
        }
        return super.receiptLogoUrl;
    },
});
