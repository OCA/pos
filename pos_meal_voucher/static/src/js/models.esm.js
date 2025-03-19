/** @odoo-module **/
// Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
// @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import {Order, Orderline, Payment, PosGlobalState} from "point_of_sale.models";
import {Gui} from "point_of_sale.Gui";
import {Model} from "point_of_sale.Registries";
import {_t} from "web.core";
import {round_precision as round_pr} from "web.utils";

const MealVoucherOrder = (OriginalOrder) =>
    class extends OriginalOrder {
        get_total_meal_voucher_eligible() {
            return round_pr(
                this.orderlines.reduce(function (sum, orderLine) {
                    if (orderLine.product.meal_voucher_ok) {
                        return sum + orderLine.get_price_with_tax();
                    }
                    return sum;
                }, 0),
                this.pos.currency.rounding
            );
        }

        get_total_meal_voucher_non_eligible() {
            return round_pr(
                this.orderlines.reduce(function (sum, orderLine) {
                    if (!orderLine.product.meal_voucher_ok) {
                        return sum + orderLine.get_price_with_tax();
                    }
                    return sum;
                }, 0),
                this.pos.currency.rounding
            );
        }

        get_total_meal_voucher_received() {
            return round_pr(
                this.paymentlines.reduce(function (sum, paymentLine) {
                    if (paymentLine.is_meal_voucher()) {
                        return sum + paymentLine.get_amount();
                    }
                    return sum;
                }, 0),
                this.pos.currency.rounding
            );
        }

        async _meal_voucher_is_valid(code) {
            for (const payment_line of this.paymentlines) {
                if (payment_line.payment_note === code) {
                    await Gui.showPopup("ErrorPopup", {
                        title: _t("Invalid Meal Voucher"),
                        body: _.str.sprintf(
                            _t(
                                'The paper meal voucher with code "%s" has already been scanned.'
                            ),
                            code
                        ),
                    });
                    return false;
                }
            }
            return true;
        }

        async handle_meal_voucher_barcode(code) {
            if (!(await this._meal_voucher_is_valid(code.code))) {
                return;
            }
            // Add new payment line with the amount found in the barcode.
            const payment_line = this.add_paymentline(
                this.pos.paper_meal_voucher_payment_method
            );
            payment_line.set_amount(code.value);
            payment_line.payment_note = code.code;
        }
    };

Model.extend(Order, MealVoucherOrder);

const RECEIPT_ORDER_LINE_PREFIX = "(*) ";

const MealVoucherOrderline = (OriginalOrderline) =>
    class extends OriginalOrderline {
        generate_wrapped_product_name() {
            if (
                !this.get_product().meal_voucher_ok ||
                !this.pos.config.enable_meal_voucher_receipt_info
            ) {
                return super.generate_wrapped_product_name(...arguments);
            }
            // Temporarily change the product name to add a prefix on the
            // receipt.
            //
            // .generate_wrapped_product_name() calls
            // .get_full_product_name(), and it has a different behavior
            // depending on whether this.full_product_name is set or not. both
            // behaviors must be handled, because one is used when generating
            // a receipt during an order, while the order is used when
            // retrieving a receipt from a previous order.
            // .get_full_product_name() cannot be overridden because its
            // result is also used for display in the product screen and
            // its result is stored, which would result in the prefix being
            // added each time the pos interface is reloaded.
            const originalFullProductName = this.full_product_name;
            const originalDisplayName = this.product.display_name;
            if (originalFullProductName) {
                this.full_product_name =
                    RECEIPT_ORDER_LINE_PREFIX + originalFullProductName;
            } else {
                this.product.display_name =
                    RECEIPT_ORDER_LINE_PREFIX + originalDisplayName;
            }
            const res = super.generate_wrapped_product_name(...arguments);
            if (originalFullProductName) {
                this.full_product_name = originalFullProductName;
            } else {
                this.product.display_name = originalDisplayName;
            }
            return res;
        }
    };

Model.extend(Orderline, MealVoucherOrderline);

const MealVoucherPayment = (OriginalPayment) =>
    class extends OriginalPayment {
        initialize() {
            super.initialize(...arguments);
            this.payment_note = null;
        }

        init_from_JSON(json) {
            super.init_from_JSON(...arguments);
            this.payment_note = json.payment_note;
        }

        export_as_JSON() {
            const res = super.export_as_JSON(...arguments);
            res.payment_note = this.payment_note;
            return res;
        }

        is_meal_voucher() {
            return this.payment_method.meal_voucher_type !== false;
        }
    };

Model.extend(Payment, MealVoucherPayment);

const MealVoucherPosGlobalState = (OriginalPosGlobalState) =>
    class extends OriginalPosGlobalState {
        async load_server_data() {
            await super.load_server_data(...arguments);
            this.paper_meal_voucher_payment_method = null;
            for (const payment_method_id of this.config.payment_method_ids) {
                const payment_method = this.payment_methods_by_id[payment_method_id];
                if (payment_method.meal_voucher_type === "paper") {
                    this.paper_meal_voucher_payment_method = payment_method;
                    break;
                }
            }
        }
    };

Model.extend(PosGlobalState, MealVoucherPosGlobalState);
