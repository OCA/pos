/* Copyright 2021-22 Tecnativa - David Vidal
   License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).*/
odoo.define("pos_payment_method_cashdro.payment", function (require) {
    "use strict";

    var PaymentInterface = require("point_of_sale.PaymentInterface");

    const PaymentCashdro = PaymentInterface.extend({
        /**
         * @override
         */
        send_payment_cancel: function () {
            this._super(...arguments);
            const operation = this.pos.get_order().cashdro_operation;
            if (!operation) {
                return Promise.resolve();
            }
            return this.cashdro_finish_operation(operation);
        },

        /**
         * @override
         */
        send_payment_request: function () {
            this._super(...arguments);
            const order = this.pos.get_order();
            const line = order.selected_paymentline;
            line.set_payment_status("waiting");
            return this.cashdro_send_payment_request(order);
        },

        // --------------------------------------------------------------------------
        // Private
        // --------------------------------------------------------------------------

        cashdro_send_payment_request: async function (order) {
            // The payment is done in three concatenated steps:
            // 1. The POS send a payment request, to which the Cashdro respondes
            //    with an operation id.
            // 2. Then the POS has to acknowledge that such operation id has
            //    been received.
            // 3. Once acknowledged the POS has to send a payment request to the
            //    cashdro. Once the Cashdro responses with a "F" state (for
            //    finished) we'll get the response and fill the tendered money
            //    for the payment line.
            const payment_line = order.selected_paymentline;
            // Cashdro treats decimals as positions in an integer we also have
            // to deal with floating point computing to avoid decimals at the
            // end or the drawer will reject our request.
            const amount = parseInt(order.get_due(payment_line).toFixed(2) * 100, 10);
            const res = await this._cashdro_request(
                this._cashdro_payment_url({amount: amount})
            );
            // It comes handy to log the response from the drawer, as
            // we can diagnose the right sytmoms for each issue
            console.log(res);
            const operation_id = res.data || "";
            this.pos.get_order().cashdro_operation = operation_id;
            // Acknowledge the operation
            var ack_url = this._cashdro_ack_url(operation_id);
            const res_ack = await this._cashdro_request(ack_url);
            // Validate the operation
            console.log(res_ack);
            var ask_url = this._cashdro_ask_url(operation_id);
            const operation_data = await this._cashdro_request_payment(ask_url);
            // This might be too verbose, but it helps a lot to diagnose issues and
            // their reasons.
            console.log(operation_data);
            var data = JSON.parse(operation_data.data);
            payment_line.cashdro_operation_data = data;
            var tendered = data.operation.totalin / 100;
            payment_line.set_amount(tendered);
            return true;
        },

        cashdro_finish_operation: async function (operation) {
            // Finish the Cashdro running operation
            var order = this.pos.get_order();
            if (operation) {
                await this._cashdro_request(this._cashdro_finish_url(operation));
                order.cashdro_operation = false;
            }
        },

        // API communication methods

        _cashdro_url: function () {
            // Cashdro machines don't support safe POST calls, so we're sending
            // all the data quite unsafely constantly...
            const method = this.pos.get_order().selected_paymentline.payment_method;
            const host = method && method.cashdro_host;
            if (!host) {
                return false;
            }
            let url = `https://${host}/Cashdro3WS/index.php`;
            url += `?name=${method.cashdro_user}`;
            url += `&password=${method.cashdro_password}`;
            return url;
        },

        _cashdro_payment_url: function (parameters) {
            // Compose the url for a sale report to Cashdro
            const user = this.pos.get_cashier().id || this.pos.user.id;
            let url = `${this._cashdro_url()}&operation=startOperation&type=4`;
            url += `&posid=pos-${this.pos.pos_session.name}`;
            url += `&posuser=${user}`;
            url += `&parameters=${JSON.stringify(parameters)}`;
            return url;
        },

        _cashdro_ack_url: function (operation_id) {
            // Compose the url for a sale report to Cashdro
            var url = this._cashdro_url();
            url += "&operation=acknowledgeOperationId";
            url += "&operationId=" + operation_id;
            return url;
        },

        _cashdro_ask_url: function (operation_id) {
            // Compose the url for to report a sale to Cashdro
            var url = this._cashdro_url();
            url += "&operation=askOperation";
            url += "&operationId=" + operation_id;
            return url;
        },

        _cashdro_finish_url: function (operation_id) {
            // Compose the url for a sale report to Cashdro
            var url = this._cashdro_url();
            url += "&operation=finishOperation&type=2";
            url += "&operationId=" + operation_id;
            return url;
        },

        _cashdro_request: function (url) {
            // We'll use it for regular requests
            return $.ajax({
                url: url,
                method: "GET",
                async: true,
                success: function (response) {
                    return response;
                },
            });
        },

        /**
         * This is a special request, as we keep requesting the CashDro  until we get
         * the *finished* state that will give us the amount received in the cashdrawer.
         *
         * @param {String} request_url
         * @returns promise
         */
        _cashdro_request_payment: function (request_url) {
            var def = $.Deferred();
            var _request_payment = (url) => {
                $.ajax({
                    url: url,
                    method: "GET",
                    success: (response) => {
                        var data = JSON.parse(response.data);
                        if (data.operation.state === "F") {
                            def.resolve(response);
                        } else {
                            _request_payment(url);
                        }
                    },
                });
            };
            _request_payment(request_url);
            return def;
        },
    });

    return PaymentCashdro;
});
