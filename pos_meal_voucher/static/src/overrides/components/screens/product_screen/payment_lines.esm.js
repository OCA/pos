import {PaymentScreenPaymentLines} from "@point_of_sale/app/screens/payment_screen/payment_lines/payment_lines";
import {patch} from "@web/core/utils/patch";

patch(PaymentScreenPaymentLines.prototype, {
    isMealVoucher(line) {
        return line.payment_method_id.meal_voucher_type !== false;
    },
});
