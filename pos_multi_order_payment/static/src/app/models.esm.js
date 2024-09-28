/** @odoo-module **/

import {Order, Payment} from "@point_of_sale/app/store/models";

import {patch} from "@web/core/utils/patch";

patch(Order.prototype, {
    setup() {
        this.payment_order_id = false;
        super.setup(...arguments);
    },
    init_from_JSON(json) {
        super.init_from_JSON(...arguments);
        this.payment_order_id = json.payment_order_id;
    },
    export_as_JSON() {
        const json = super.export_as_JSON(...arguments);
        if (this.payment_order_id) {
            json.payment_order_id = this.payment_order_id.server_id;
        }
        return json;
    },
    add_paymentline_amount(payment_method, due) {
        this.assert_editable();
        if (this.electronic_payment_in_progress()) {
            return false;
        }
        var newPaymentline = new Payment(
            {env: this.env},
            {order: this, payment_method: payment_method, pos: this.pos}
        );
        this.paymentlines.add(newPaymentline);
        this.select_paymentline(newPaymentline);
        if (this.pos.config.cash_rounding) {
            this.selected_paymentline.set_amount(0);
        }
        newPaymentline.set_amount(due);

        if (payment_method.payment_terminal) {
            newPaymentline.set_payment_status("pending");
        }
        return newPaymentline;
    },
});
