import {PaymentScreen} from "@point_of_sale/app/screens/payment_screen/payment_screen";
import {patch} from "@web/core/utils/patch";

patch(PaymentScreen.prototype, {
    setup() {
        super.setup(...arguments);
        this.pos.updatePaymentMethod();
    },

    get paymentMethodsUnlock() {
        return this.pos.paymentMethodsUnlock;
    },

    get paymentMethodsLock() {
        return this.pos.paymentMethodsLock;
    },

    get remainderLimitFormatted() {
        return this.env.utils.formatCurrency(this.pos.remainderLimit);
    },
});
