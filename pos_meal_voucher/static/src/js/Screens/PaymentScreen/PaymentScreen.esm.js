/** @odoo-module **/
// SPDX-FileCopyrightText: 2025 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {Component} from "point_of_sale.Registries";
import PaymentScreen from "point_of_sale.PaymentScreen";
import {useBarcodeReader} from "point_of_sale.custom_hooks";

const MealVoucherPaymentScreen = (OriginalPaymentScreen) =>
    class extends OriginalPaymentScreen {
        setup() {
            super.setup();
            if (this.env.pos.paper_meal_voucher_payment_method !== null) {
                useBarcodeReader({
                    meal_voucher_payment: this._barcodeMealVoucherAction,
                });
            }
        }

        async _barcodeMealVoucherAction(code) {
            return this.currentOrder.handle_meal_voucher_barcode(code);
        }

        get hasMealVoucherPaymentMethod() {
            return this.env.pos.config.has_meal_voucher_payment_method;
        }

        get mealVoucherEligibleAmount() {
            return this.currentOrder.get_total_meal_voucher_eligible();
        }

        get mealVoucherReceivedAmount() {
            return this.currentOrder.get_total_meal_voucher_received();
        }

        get maxMealVoucherAmount() {
            return this.env.pos.config.max_meal_voucher_amount;
        }
    };

Component.extend(PaymentScreen, MealVoucherPaymentScreen);
