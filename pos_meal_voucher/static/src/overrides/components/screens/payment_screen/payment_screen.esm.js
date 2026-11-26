import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {PaymentScreen} from "@point_of_sale/app/screens/payment_screen/payment_screen";
import {patch} from "@web/core/utils/patch";
import {useBarcodeReader} from "@point_of_sale/app/barcode/barcode_reader_hook";

patch(PaymentScreen.prototype, {
    setup() {
        super.setup();
        useBarcodeReader({
            meal_voucher_payment: this._barcodeMealVoucherAction,
        });
    },
    async _barcodeMealVoucherAction(code) {
        const result = await this.currentOrder.handle_meal_voucher_barcode(code);
        if (result instanceof Object) {
            this.dialog.add(AlertDialog, {
                title: result.title,
                body: result.body,
            });
        }
    },
    get hasMealVoucherPaymentMethod() {
        return this.pos.config.has_meal_voucher_payment_method;
    },
    get mealVoucherEligibleAmount() {
        return this.currentOrder.get_total_meal_voucher_eligible();
    },
    get mealVoucherReceivedAmount() {
        return this.currentOrder.get_total_meal_voucher_received();
    },
    get maxMealVoucherAmount() {
        return this.pos.config.max_meal_voucher_amount;
    },
});
