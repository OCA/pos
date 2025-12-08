import {PosStore} from "@point_of_sale/app/services/pos_store";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    setup() {
        super.setup(...arguments);
        this.paymentMethodsFromConfigBase = this.config.payment_method_ids
            .slice()
            .sort((a, b) => a.sequence - b.sequence);

        this.paymentMethodsUnlock = [];
        this.paymentMethodsLock = [];
        this.remainderLimit = 0.0;
        this.riskLimit = 0.0;
        this.updatePaymentMethod();
    },

    async selectPartner() {
        await super.selectPartner(...arguments);
        await this.updatePaymentMethod();
    },

    updatePaymentMethod() {
        const order = this.getOrder();
        const partner = order?.getPartner();
        if (!partner) {
            this.paymentMethodsUnlock = this.paymentMethodsFromConfigBase;
            this.paymentMethodsLock = [];
            return;
        }
        const paymentCreditLimit = this.config.payment_credit_limit_restricted_ids;
        const orderTotal = order.priceIncl + order.appliedRounding;
        this.data
            .read(
                "res.partner",
                [partner.id],
                ["risk_remaining_value", "risk_exception", "credit_limit"]
            )
            .then((partnerFields) => {
                const riskRemainingValue = partnerFields[0].risk_remaining_value;
                const riskException = partnerFields[0].risk_exception;
                const creditLimit = partnerFields[0].credit_limit;

                if (
                    riskException ||
                    (creditLimit > 0 && orderTotal > riskRemainingValue)
                ) {
                    if (paymentCreditLimit.length > 0) {
                        this.paymentMethodsUnlock =
                            this.paymentMethodsFromConfigBase.filter(
                                (method) => !paymentCreditLimit.includes(method)
                            );
                    } else {
                        this.paymentMethodsUnlock =
                            this.paymentMethodsFromConfigBase.filter(
                                (method) => !method.credit_limit_restricted
                            );
                    }
                } else {
                    this.paymentMethodsUnlock = this.paymentMethodsFromConfigBase;
                }
                this.riskLimit = riskRemainingValue;
                this.remainderLimit = (riskRemainingValue - orderTotal).toFixed(2);
                this.paymentMethodsLock = this.paymentMethodsFromConfigBase.filter(
                    (method) => !this.paymentMethodsUnlock.includes(method)
                );
            });
    },
});
