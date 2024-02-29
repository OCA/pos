/** @odoo-module */
/* Copyright 2021 Tecnativa - David Vidal
   License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).*/
import {Order, register_payment_method} from "point_of_sale.models";
import {PaymentCashdro} from "./payment_cashdro.esm";
import Registries from "point_of_sale.Registries";

register_payment_method("cashdro", PaymentCashdro);

const PaymentCashdroOrder = (OriginalOrder) =>
    class extends OriginalOrder {
        constructor() {
            super(...arguments);
            this.in_cashdro_transaction = false;
        }
        /**
         * @override
         * Set the amount to 0 as it's going to be filled by the Cashdro response
         */
        add_paymentline() {
            const line = super.add_paymentline(...arguments);
            if (!line) {
                return line;
            }
            if (
                line.payment_method &&
                line.payment_method.use_payment_terminal === "cashdro"
            ) {
                line.set_amount(0);
            }
            return line;
        }
    };

Registries.Model.extend(Order, PaymentCashdroOrder);
