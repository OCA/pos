/** @odoo-module */

import {PaymentScreen} from "@point_of_sale/app/screens/payment_screen/payment_screen";
import {serializeDateTime} from "@web/core/l10n/dates";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(PaymentScreen.prototype, {
    setup() {
        super.setup();
        // Store all payment methods before any filtering
        this._allPaymentMethods = [...this.payment_methods_from_config];
    },

    /**
     * Filter payment methods based on current online/offline state.
     * Called on mount and before adding payment lines to stay reactive.
     */
    _updatePaymentMethodsForOffline() {
        if (this.pos.data.network.offline) {
            this.payment_methods_from_config = this._allPaymentMethods.filter(
                (pm) => !pm.use_payment_terminal
            );
        } else {
            this.payment_methods_from_config = this._allPaymentMethods;
        }
    },

    onMounted() {
        this._updatePaymentMethodsForOffline();
        super.onMounted();
    },

    addNewPaymentLine(paymentMethod) {
        // Re-check offline status before adding payment line
        this._updatePaymentMethodsForOffline();
        return super.addNewPaymentLine(paymentMethod);
    },

    /**
     * Override _finalizeValidation to handle offline scenarios:
     * - Skip invoice download when offline
     * - Skip server sync, go directly to receipt
     */
    async _finalizeValidation() {
        if (!this.pos.data.network.offline) {
            return super._finalizeValidation();
        }

        // === Offline finalization flow ===
        if (this.currentOrder.is_paid_with_cash() || this.currentOrder.get_change()) {
            this.hardwareProxy.openCashbox();
        }

        this.currentOrder.date_order = serializeDateTime(luxon.DateTime.now());

        for (const line of this.paymentLines) {
            if (line.amount === 0) {
                this.currentOrder.remove_paymentline(line);
            }
        }

        this.pos.addPendingOrder([this.currentOrder.id]);
        this.currentOrder.state = "paid";

        this.notification.add(
            _t("Order saved offline. It will be synced when connection is restored."),
            {type: "warning"}
        );

        await this.afterOrderValidation(false);
    },
});
