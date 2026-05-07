import {_t} from "@web/core/l10n/translation";
import {PaymentScreen} from "@point_of_sale/app/screens/payment_screen/payment_screen";
import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {patch} from "@web/core/utils/patch";

const originalSendForceDone = PaymentScreen.prototype.sendForceDone;

patch(PaymentScreen.prototype, {
    async sendForceDone(line) {
        this.dialog.add(ConfirmationDialog, {
            body: _t(
                "Warning: are you sure you have collected payment from the customer by card? You risk desynchronizing the point of sale."
            ),
            confirmLabel: _t("No, go back"),
            confirm: () => {},
            cancelLabel: _t("Yes"),
            cancel: async () => {
                await originalSendForceDone.call(this, line);
            },
        });
    },
});
