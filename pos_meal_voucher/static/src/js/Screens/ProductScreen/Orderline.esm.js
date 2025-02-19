/** @odoo-module **/
// SPDX-FileCopyrightText: 2025 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {Component} from "point_of_sale.Registries";
import Orderline from "point_of_sale.Orderline";

const MealVoucherOrderline = (OriginalOrderline) =>
    class extends OriginalOrderline {
        get displayMealVoucherIcon() {
            return (
                this.env.pos.config.enable_meal_voucher_order_lines_icon &&
                this.props.line.get_product().meal_voucher_ok
            );
        }
    };

Component.extend(Orderline, MealVoucherOrderline);
