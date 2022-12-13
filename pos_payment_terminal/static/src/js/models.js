/*
    POS Payment Terminal module for Odoo
    Copyright (C) 2014-2020 Aurélien DUMAINE
    Copyright (C) 2014-2020 Akretion (www.akretion.com)
    @author: Aurélien DUMAINE
    @author: Alexis de Lattre <alexis.delattre@akretion.com>
    @author: Denis Roussel <denis.roussel@acsone.eu>
    @author: Stéphane Bidoul <stephane.bidoul@acsone.eu>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_payment_terminal.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");
    const {PosGlobalState, Payment} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    var OCAPaymentTerminal = require("pos_payment_terminal.payment");
    models.register_payment_method("oca_payment_terminal", OCAPaymentTerminal);

    const PosPaymentTerminalPosGlobalState = (PosGlobalState) =>
        class PosPaymentTerminalPosGlobalState extends PosGlobalState {
            // @override
            async after_load_server_data() {
                for (var payment_method_id in this.payment_methods) {
                    var payment_method = this.payment_methods[payment_method_id];
                    if (payment_method.use_payment_terminal == "oca_payment_terminal") {
                        this.config.use_proxy = true;
                    }
                }
                return await super.after_load_server_data(...arguments);
            }
        };
    Registries.Model.extend(PosGlobalState, PosPaymentTerminalPosGlobalState);

    const PosPaymentTerminalPayment = (Payment) =>
        class PosPaymentTerminalPayment extends Payment {
            constructor() {
                super(...arguments);
                // Id of the terminal transaction, used to find the payment
                // line corresponding to a terminal transaction status coming
                // from the terminal driver.
                this.terminal_transaction_id = null;
                // Success: null: in progress, false: failed: true: succeeded
                this.terminal_transaction_success = null;
                // Human readable transaction status, set if the transaction failed.
                this.terminal_transaction_status = null;
                // Additional information about the transaction status.
                this.terminal_transaction_status_details = null;
            }
            // @override
            init_from_JSON(json) {
                super.init_from_JSON(json);
                this.terminal_transaction_id = json.terminal_transaction_id;
                this.terminal_transaction_success = json.terminal_transaction_success;
                this.terminal_transaction_status = json.terminal_transaction_status;
                this.terminal_transaction_status_details =
                    json.terminal_transaction_status_details;
            }
            // @override
            export_as_JSON() {
                var vals = super.export_as_JSON();
                vals.terminal_transaction_id = this.terminal_transaction_id;
                vals.terminal_transaction_success = this.terminal_transaction_success;
                vals.terminal_transaction_status_details =
                    this.terminal_transaction_status_details;
                return vals;
            }
        };
    Registries.Model.extend(Payment, PosPaymentTerminalPayment);
});
