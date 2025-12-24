import {PosPayment} from "@point_of_sale/app/models/pos_payment";
import {patch} from "@web/core/utils/patch";

patch(PosPayment.prototype, {
    set_payment_terminal_return_message(message) {
        this.payment_terminal_return_message = message;
    },
});
