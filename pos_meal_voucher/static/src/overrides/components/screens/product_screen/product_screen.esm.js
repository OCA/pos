import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {patch} from "@web/core/utils/patch";
import {useBarcodeReader} from "@point_of_sale/app/barcode/barcode_reader_hook";

patch(ProductScreen.prototype, {
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
        } else {
            this.pos.showScreen("PaymentScreen", {
                orderUuid: this.currentOrder.uuid,
            });
        }
    },
});
