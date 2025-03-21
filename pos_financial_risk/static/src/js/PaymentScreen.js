/** @odoo-module **/

import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";
import { usePos } from "@point_of_sale/app/store/pos_hook";

patch(PaymentScreen.prototype, {
    setup() {
        super.setup();
        this.orm = useService("orm");
        this.pos = usePos();
        this.paymentMethodsFromConfigBase = this.payment_methods_from_config;
        this.paymentMethodsUnlock = [];
        this.paymentMethodsLock = [];
        this.remainderLimit = 0.0;
        this.riskLimit = 0.0;
        this.updatePaymentMethod();
    },

    async selectPartner() {
        await super.selectPartner();
        await this.updatePaymentMethod();
    },

    updatePaymentMethod() {
        const order = this.currentOrder;
        const partner = order.partner;
        if (!partner) {
            this.paymentMethodsUnlock = this.paymentMethodsFromConfigBase;
            this.paymentMethodsLock = [];
            this.render(true);
            return;
        }
        const paymentCreditLimit = this.pos.config.payment_credit_limit_restricted_ids;
        const orderTotal = order.get_total_with_tax() + order.get_rounding_applied();
        this.orm.call("res.partner", "read", [partner.id, ["risk_remaining_value", "risk_exception", "credit_limit"]])
            .then((partnerFields) => {
                const riskRemainingValue = partnerFields[0].risk_remaining_value;
                const riskException = partnerFields[0].risk_exception;
                const creditLimit = partnerFields[0].credit_limit;
                console.log("riskRemainingValue", riskRemainingValue);
                console.log("riskException", riskException);
                console.log("creditLimit", creditLimit);
                console.log("orderTotal", orderTotal);
                if (riskException || (creditLimit > 0 && orderTotal > riskRemainingValue)) {
                    if (paymentCreditLimit.length > 0) {
                        this.paymentMethodsUnlock = this.paymentMethodsFromConfigBase.filter(
                            (method) => !paymentCreditLimit.includes(method.id)
                        );
                    } else {
                        this.paymentMethodsUnlock = this.paymentMethodsFromConfigBase.filter(
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
                this.render(true);
            });
    },
});
