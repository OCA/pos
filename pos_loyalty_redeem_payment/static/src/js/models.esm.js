/** @odoo-module **/

import {Order, Payment} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

export const RedeemPaymentOrder = (OriginalOrder) =>
    class extends OriginalOrder {
        has_redeem_payment_lines() {
            return this.paymentlines.some(
                (pl) => pl.payment_method.used_for_loyalty_program
            );
        }

        wait_for_push_order() {
            let result = super.wait_for_push_order(...arguments);
            result = Boolean(result ||  this.pos.config.allow_auto_print_giftcard && this.has_redeem_payment_lines());
            return result;
        }
    };

Registries.Model.extend(Order, RedeemPaymentOrder);

export const PosVoucherRedeemPayment = (OriginalPayment) =>
    class extends OriginalPayment {
        constructor(obj, options) {
            super(obj, options);
            this.coupon_data = this.coupon_data || null;
        }

        export_as_JSON() {
            const json = super.export_as_JSON(...arguments);
            json.coupon_data = this.coupon_data;
            return json;
        }

        init_from_JSON(json) {
            super.init_from_JSON(...arguments);
            this.coupon_data = json.coupon_data;
        }
    };

Registries.Model.extend(Payment, PosVoucherRedeemPayment);
