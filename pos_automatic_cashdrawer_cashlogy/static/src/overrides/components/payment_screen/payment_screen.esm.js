import {AutomaticCashdrawerCashInDialog} from "@pos_automatic_cashdrawer_cashlogy/dialogs/cashdrawer_cash_in.esm";
import {PaymentScreen} from "@point_of_sale/app/screens/payment_screen/payment_screen";
import {patch} from "@web/core/utils/patch";

patch(PaymentScreen.prototype, {
    async addNewPaymentLine(paymentMethod) {
        const result = super.addNewPaymentLine(paymentMethod);
        const line = this.selectedPaymentLine;
        if (line && line.get_iface_automatic_cashdrawer()) {
            this.openCashdrawerCashInDialog(line);
        }
        return result;
    },

    openCashdrawerCashInDialog(line) {
        const amount = line.get_amount();
        this.dialog.add(AutomaticCashdrawerCashInDialog, {
            to_collect: amount,
            allow_cancel: true,
            auto_accept: true,
            payment: true,
            confirmCashIn: (amountIn) => {
                line.set_amount(amountIn);
            },
            cancelCashIn: () => {
                this.deletePaymentLine(line.uuid);
            },
        });
    },
});
