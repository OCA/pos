/** @odoo-module **/

import {ErrorPopup} from "@point_of_sale/app/errors/popups/error_popup";
import {PaymentScreen} from "@point_of_sale/app/screens/payment_screen/payment_screen";
import {PaymentScreenStatus} from "@point_of_sale/app/screens/payment_screen/payment_status/payment_status";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {roundPrecision as round_pr} from "@web/core/utils/numbers";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {useState} from "@odoo/owl";

patch(PaymentScreenStatus.prototype, {
    setup() {
        super.setup();
        this.pos = usePos();
    },
    get totalDueText() {
        var change =
            this.props.order.get_total_with_tax() +
            this.props.order.get_rounding_applied();
        for (const order of Object.values(this.props.selectedExtraOrders)) {
            change = change + order.get_total_with_tax() + order.get_rounding_applied();
        }
        return this.env.utils.formatCurrency(change);
    },
    get remainingText() {
        var due = this.props.order.get_due();
        for (const order of Object.values(this.props.selectedExtraOrders)) {
            due += order.get_due();
        }
        return this.env.utils.formatCurrency(due > 0 ? due : 0);
    },
    get changeText() {
        var change = this.props.order.get_change();
        for (const order of Object.values(this.props.selectedExtraOrders)) {
            change =
                change +
                order.get_total_paid() -
                order.get_total_with_tax() -
                order.get_rounding_applied();
        }
        return this.env.utils.formatCurrency(
            round_pr(Math.max(0, change), this.pos.currency.rounding)
        );
    },
});

patch(PaymentScreen.prototype, {
    setup() {
        super.setup(...arguments);
        this.selectedExtraOrders = useState({orders: {}});
    },
    appendOrder(order) {
        var orders = this.selectedExtraOrders.orders;
        if (this.selectedExtraOrders.orders[order.cid] === undefined) {
            orders[order.cid] = order;
        } else {
            delete orders[order.cid];
        }
        this.selectedExtraOrders.orders = {...orders};
    },
    addNewPaymentLine(paymentMethod) {
        if (Object.keys(this.selectedExtraOrders.orders).length === 0) {
            return super.addNewPaymentLine(...arguments);
        }
        var due = this.currentOrder.get_due();
        for (const order of Object.values(this.selectedExtraOrders.orders)) {
            due += order.get_due();
        }
        const result = this.currentOrder.add_paymentline_amount(paymentMethod, due);
        if (result) {
            this.numberBuffer.reset();
            return true;
        }
        this.popup.add(ErrorPopup, {
            title: _t("Error"),
            body: _t("There is already an electronic payment in progress."),
        });
        return false;
    },
    async _finalizeValidation() {
        await super._finalizeValidation(...arguments);
        for (const order_key in this.selectedExtraOrders.orders) {
            const order = this.selectedExtraOrders.orders[order_key];
            if (!order.finalized) {
                /*
                    This should only happen on offline mode
                */
                order.finalized = true;
                order.payment_order_id = this.currentOrder;
            }
        }
    },
    get orders() {
        return this.pos.orders.filter(
            (o) => o.canPay() && o.cid !== this.currentOrder.cid
        );
    },
    async afterOrderValidation() {
        await super.afterOrderValidation(...arguments);
        for (const order_key in this.selectedExtraOrders.orders) {
            /*
                We need to set all the selected extra orders as payed.
            */
            const order = this.selectedExtraOrders.orders[order_key];
            order.finalized = true;
            order.date_order = luxon.DateTime.now();
            order.payment_order_id = this.currentOrder;
            var syncOrderResult = await this.pos.push_single_order(order);
            if (
                syncOrderResult &&
                syncOrderResult.length > 0 &&
                order.wait_for_push_order()
            ) {
                await this._postPushOrderResolve(
                    order,
                    syncOrderResult.map((res) => res.id)
                );
            }
            this.pos.db.remove_unpaid_order(order);
        }
    },
});
