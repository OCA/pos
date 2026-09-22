import {DebugWidget} from "@point_of_sale/app/debug/debug_widget";
import {patch} from "@web/core/utils/patch";

patch(DebugWidget.prototype, {
    async cashlogyOpenBackOffice() {
        for (const payment_method of this.pos._get_cashlogy_payment_methods()) {
            await payment_method
                ._cashlogy_request_open_back_office()
                .catch(console.error);
        }
    },
});
