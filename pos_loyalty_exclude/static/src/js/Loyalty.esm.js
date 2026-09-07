/** @odoo-module **/

import {Order} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

export const PosLoyaltyOrder = (OriginalOrder) =>
    class extends OriginalOrder {
        _getDiscountableOnOrder(reward) {
            const result = super._getDiscountableOnOrder(reward);
            const productExclude = this.orderlines.filter(
                (line) => line.get_product().loyalty_exclude
            );
            for (const line of productExclude) {
                const taxKey = ["ewallet", "gift_card"].includes(
                    reward.program_id.program_type
                )
                    ? line.get_taxes().map((t) => t.id)
                    : line
                          .get_taxes()
                          .filter((t) => t.amount_type !== "fixed")
                          .map((t) => t.id);
                result.discountable -= line.get_price_with_tax();
                if (result.discountablePerTax[taxKey]) {
                    result.discountablePerTax[taxKey] -= line.get_base_price();
                }
            }
            return result;
        }
        _getCheapestLine() {
            const result = super._getCheapestLine();
            if (!result || !result.get_product().loyalty_exclude) {
                return result;
            }
            let cheapestLine = null;
            for (const line of this.get_orderlines().filter(
                (l) => !l.get_product().loyalty_exclude
            )) {
                if (line.reward_id || !line.get_quantity()) {
                    continue;
                }
                if (!cheapestLine || cheapestLine.price > line.price) {
                    cheapestLine = line;
                }
            }
            return cheapestLine;
        }

        getClaimableRewards(coupon_id = false, program_id = false, auto = false) {
            const hasDiscountableLine = this.get_orderlines().some(
                (line) => !line.get_product().loyalty_exclude && line.get_quantity()
            );
            if (hasDiscountableLine) {
                return super.getClaimableRewards(coupon_id, program_id, auto);
            }
            return [];
        }

        _get_regular_order_lines() {
            const orderLines = super._get_regular_order_lines();
            if (orderLines) {
                return orderLines.filter((line) => !line.get_product().loyalty_exclude);
            }
            return orderLines;
        }
    };
Registries.Model.extend(Order, PosLoyaltyOrder);
