/** @odoo-module **/

import NumberBuffer from "point_of_sale.NumberBuffer";
import PaymentScreen from "point_of_sale.PaymentScreen";
import Registries from "point_of_sale.Registries";
import session from "web.session";

export const CouponPosPaymentScreen = (OriginalPaymentScreen) =>
    class extends OriginalPaymentScreen {
        _updateSelectedPaymentline() {
            // Disallow payment line editing
            if (this.selectedPaymentLine && this.selectedPaymentLine.coupon_data)
                return;
            super._updateSelectedPaymentline();
        }

        async isValidCode(code, paymentMethod) {
            const order = this.env.pos.get_order();
            const customer = order.get_partner();
            return await this.env.services.rpc({
                model: "pos.config",
                method: "use_coupon_code",
                args: [
                    [this.env.pos.config.id],
                    code,
                    order.creation_date,
                    customer ? customer.id : false,
                ],
                kwargs: {
                    context: {
                        from_payment_screen: true,
                        payment_method_id: paymentMethod.id,
                    },
                },
            });
        }

        // If voucher code has already been activated,
        // we cannot used twice in same or different orders without being processed.
        // First we have to process the order and then use it again.
        codeIsDuplicated(orders, code) {
            return orders.some((order) =>
                order.paymentlines.some(
                    (line) => line.coupon_data && line.coupon_data.code === code
                )
            );
        }

        hasBeenScanned(code) {
            const pending_orders = this.env.pos.get_order_list();
            if (this.codeIsDuplicated(pending_orders, code)) {
                this.showNotification(
                    this.env._t(
                        "That coupon code has already been scanned and activated. Please, process pending orders."
                    ),
                    5000
                );
                return false;
            }
            return true;
        }

        async insertAndValidateCode(paymentMethod) {
            const {confirmed, payload: code} = await this.showPopup("TextInputPopup", {
                title: this.env._t("Enter Code"),
                startingValue: "",
                placeholder: this.env._t("Gift Card"),
            });
            if (!confirmed || !this.hasBeenScanned(code)) return 0;

            const trimmedCode = code.trim();
            if (trimmedCode) {
                const {successful, payload} = await this.isValidCode(
                    trimmedCode,
                    paymentMethod
                );
                if (successful) {
                    return {payload, code};
                }
                this.showNotification(payload.error_message, 5000);
            }
            return 0;
        }

        async insertAmountToRedeem(maxVoucherAmount) {
            const to_paid = Math.min(maxVoucherAmount, this.currentOrder.get_due());
            const {confirmed, payload: amount} = await this.showPopup(
                "ResponsiveNumberPopup",
                {
                    startingValue: 0,
                    title: _.str.sprintf(
                        this.env._t("Set amount to redeem, up to %s"),
                        this.env.pos.format_currency(to_paid)
                    ),
                }
            );
            if (confirmed) {
                const new_amount = parseFloat(amount.replace(",", "."));
                if (new_amount <= maxVoucherAmount) {
                    return new_amount;
                }
                this.showPopup("ErrorPopup", {
                    body: _.str.sprintf(
                        this.env._t(
                            "You tried to redeem %s, but maximum for this gift card in this order is %s"
                        ),
                        this.env.pos.format_currency(new_amount),
                        this.env.pos.format_currency(maxVoucherAmount)
                    ),
                });
            }
            return 0;
        }

        // Only valid for voucher and gift card programs
        async applyProgramAsPaymentMethod(paymentMethod) {
            const {payload, code} = await this.insertAndValidateCode(paymentMethod);
            if (payload) {
                const maxCouponValue = Math.min(
                    this.currentOrder.get_total_with_tax(),
                    payload.points
                );
                const amount = await this.insertAmountToRedeem(maxCouponValue);
                if (amount) {
                    const newPaymentLine =
                        this.currentOrder.add_paymentline(paymentMethod);
                    newPaymentLine.set_amount(amount);
                    // Amount = amount to redeem
                    newPaymentLine.coupon_data = {coupon: payload, amount, code};
                    newPaymentLine.coupon_id = payload.coupon_id;
                    if (newPaymentLine) {
                        NumberBuffer.reset();
                    } else {
                        this.showPopup("ErrorPopup", {
                            title: this.env._t("Error"),
                            body: this.env._t(
                                "There is already an electronic payment in progress."
                            ),
                        });
                    }
                }
            }
        }

        addNewPaymentLine({detail: paymentMethod}) {
            const order = this.currentOrder;
            if (
                order.get_due() &&
                order.get_subtotal() > 0 &&
                paymentMethod.used_for_loyalty_program
            ) {
                this.applyProgramAsPaymentMethod(paymentMethod);
                return;
            }
            if (
                (order.get_due() < 0 || order.get_subtotal() < 0) &&
                paymentMethod.used_for_loyalty_program
            ) {
                this.showPopup("ErrorPopup", {
                    title: this.env._t("Error"),
                    body: this.env._t("You cannot use this payment method for refund"),
                });
                return;
            }
            super.addNewPaymentLine(...arguments);
        }

        async _postPushOrderResolve(order, order_server_ids) {
            if (order.has_redeem_payment_lines()) {
                const payload = await this.rpc({
                    model: "pos.order",
                    method: "get_loy_card_reports_from_order",
                    args: [order_server_ids],
                    kwargs: {context: session.user_context},
                });
                if (payload.coupon_report) {
                    for (const report_entry of Object.entries(payload.coupon_report)) {
                        await this.env.legacyActionManager.do_action(report_entry[0], {
                            additional_context: {
                                active_ids: report_entry[1],
                            },
                        });
                    }
                }
                if (payload.new_coupon_info) {
                    order.new_coupon_info = payload.new_coupon_info;
                }
            }
            return super._postPushOrderResolve(...arguments);
        }
    };

Registries.Component.extend(PaymentScreen, CouponPosPaymentScreen);
