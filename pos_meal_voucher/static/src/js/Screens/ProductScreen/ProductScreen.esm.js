/** @odoo-module **/
// SPDX-FileCopyrightText: 2025 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {Component} from "point_of_sale.Registries";
import ProductScreen from "point_of_sale.ProductScreen";
import {useBarcodeReader} from "point_of_sale.custom_hooks";

const MealVoucherProductScreen = (OriginalProductScreen) =>
    class extends OriginalProductScreen {
        setup() {
            super.setup();
            if (this.env.pos.paper_meal_voucher_payment_method !== null) {
                useBarcodeReader({
                    meal_voucher_payment: this._barcodeMealVoucherAction,
                });
            }
        }

        async _barcodeMealVoucherAction(code) {
            // Display the payment screen, if it is not the current one.
            this.showScreen("PaymentScreen");
            return this.currentOrder.handle_meal_voucher_barcode(code);
        }
    };

Component.extend(ProductScreen, MealVoucherProductScreen);
