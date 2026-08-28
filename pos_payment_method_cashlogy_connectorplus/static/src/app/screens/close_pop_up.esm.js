import {ClosePosPopup} from "@point_of_sale/app/navbar/closing_popup/closing_popup";
import {patch} from "@web/core/utils/patch";

patch(ClosePosPopup.prototype, {
    // Cashlogy machines need to be closed when the POS session is closed.
    async closeSession(...args) {
        for (const payment_method of this.pos._get_cashlogy_payment_methods()) {
            await payment_method.cashlogy_close_session().catch(console.error);
        }
        return await super.closeSession(...args);
    },
});
