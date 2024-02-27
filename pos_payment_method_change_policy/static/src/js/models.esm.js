/** @odoo-module **/
// Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
// @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import {Order} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

// /////////////////////////////
// Overload models.Order
// /////////////////////////////

const OverloadOrder = (OriginalOrder) =>
    class extends OriginalOrder {
        get_payment_method_of_change_policy() {
            for (var paymentId in this.get_paymentlines()) {
                var paymentLine = this.get_paymentlines()[paymentId];
                if (paymentLine.payment_method.change_policy === "profit_product") {
                    return paymentLine.payment_method;
                }
            }
            if (this.paymentlines) {
                return this.paymentlines[0].payment_method;
            }
        }

        get_change_policy() {
            var paymentMethod = this.get_payment_method_of_change_policy();
            if (paymentMethod) {
                return paymentMethod.change_policy;
            }
            return "cash";
        }
    };

Registries.Model.extend(Order, OverloadOrder);
