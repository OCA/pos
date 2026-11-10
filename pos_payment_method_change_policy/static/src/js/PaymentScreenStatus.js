// @odoo-module

import {PaymentScreenStatus} from "@point_of_sale/app/screens/payment_screen/payment_status/payment_status";
import {_t} from "@web/core/l10n/translation";
import {onWillRender} from "@odoo/owl";
import {patch} from "@web/core/utils/patch";

patch(PaymentScreenStatus.prototype, {
    setup() {
        this.customerLoss = false;
        this.customerLossAmount = 0;
        super.setup();
        onWillRender(() => {
            const order = this.props.order;
            if (!order) return;
            const method = order.get_payment_method_of_change_policy?.();
            const policy = method?.change_policy || "cash";
            const change = order.change ?? 0;
            this.customerLoss = policy === "profit_product" && change < 0;
            this.customerLossAmount = this.customerLoss ? Math.abs(change) : 0;
        });
    },
    get statusText() {
        if (this.customerLoss) {
            return _t("Customer Loss");
        }
        return super.statusText;
    },
    get amountText() {
        if (this.customerLoss) {
            return this.env.utils.formatCurrency(this.customerLossAmount);
        }
        return super.amountText;
    },
});
