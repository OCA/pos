import {OpeningControlPopup} from "@point_of_sale/app/store/opening_control_popup/opening_control_popup";
import {patch} from "@web/core/utils/patch";

patch(OpeningControlPopup.prototype, {
    async confirm(...args) {
        for (const payment_method of this.pos._get_cashlogy_payment_methods()) {
            await payment_method.cashlogy_init_session().catch(console.error);
        }
        return await super.confirm(...args);
    },
});
