/** @odoo-module **/
// SPDX-FileCopyrightText: 2025 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {Component} from "point_of_sale.Registries";
import PaymentScreenPaymentLines from "point_of_sale.PaymentScreenPaymentLines";

const MealVoucherPaymentScreenPaymentLines = (OriginalPaymentScreenPaymentLines) =>
    class extends OriginalPaymentScreenPaymentLines {
        isMealVoucher(line) {
            return line.payment_method.meal_voucher_type !== false;
        }
    };

Component.extend(PaymentScreenPaymentLines, MealVoucherPaymentScreenPaymentLines);
