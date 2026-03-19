/** @odoo-module */

import {PaymentScreen} from "@point_of_sale/app/screens/payment_screen/payment_screen";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(PaymentScreen.prototype, {
    setup() {
        super.setup();
        // Store all payment methods before any filtering
        this._allPaymentMethods = [...this.payment_methods_from_config];
    },

    /**
     * Get payment methods filtered by offline status.
     * When offline, hide methods that require a payment terminal.
     */
    getAvailablePaymentMethods() {
        if (this.pos.data.network.offline) {
            return this._allPaymentMethods.filter((pm) => !pm.use_payment_terminal);
        }
        return this._allPaymentMethods;
    },

    onMounted() {
        // Filter payment methods based on current online/offline state
        this.payment_methods_from_config = this.getAvailablePaymentMethods();
        super.onMounted();
    },

    /**
     * Override _finalizeValidation to handle offline scenarios:
     * - Skip invoice download when offline
     * - Mark order for invoicing on sync
     */
    async _finalizeValidation() {
        const isOffline = this.pos.data.network.offline;

        if (!isOffline) {
            return super._finalizeValidation();
        }

        // === Offline finalization flow ===
        if (this.currentOrder.is_paid_with_cash() || this.currentOrder.get_change()) {
            this.hardwareProxy.openCashbox();
        }

        const {serializeDateTime} = await import("@web/core/l10n/dates");
        this.currentOrder.date_order = serializeDateTime(luxon.DateTime.now());

        for (const line of this.paymentLines) {
            if (line.amount === 0) {
                this.currentOrder.remove_paymentline(line);
            }
        }

        this.pos.addPendingOrder([this.currentOrder.id]);
        this.currentOrder.state = "paid";

        // Don't try to sync - go directly to receipt
        // Note: invoicing is handled by the normal sync flow when back online.
        this.notification.add(
            _t("Order saved offline. It will be synced when connection is restored."),
            {type: "warning"}
        );

        await this.afterOrderValidation(false);
    },
});
