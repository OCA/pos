odoo.define("pos_payment_method_cashdro.screens", function (require) {
    "use strict";

    var screens = require("point_of_sale.screens");
    var core = require("web.core");


    screens.PaymentScreenWidget.include({

        render_paymentlines : function(){
            this._super.apply(this, arguments);
            var _this = this;
            this.$(".paymentlines-container").unbind("click").on(
                "click", ".cashdro-transaction-start",
                function (ev) {
                    _this.pos.get_order().in_cashdro_transaction = true;
                    _this.order_changes();
                    _this.journal = _this._get_journal($(this).data('cid'));
                    _this.cashdro_send_payment_request().done(function () {
                        _this.pos.get_order().in_cashdro_transaction = false;
                        var amount = _this.pos.get_order().selected_paymentline.amount;
                        _this.order_changes();
                        _this.render_paymentlines();
                        _this.$('.paymentline.selected .edit').text(_this.format_currency_no_symbol(amount));
                    });
            }).on(
                "click", ".cashdro-transaction-cancel",
                function (ev) {
                _this.pos.get_order().in_cashdro_transaction = false;
                _this.order_changes();
                _this.journal = _this._get_journal($(this).data('cid'));
            	_this.cashdro_finish_operation(_this.pos.get_order().cashdro_operation);
                }
            );
        },

        order_changes: function(){
            this._super.apply(this, arguments);
            var order = this.pos.get_order();
            if (!order) {
                return;
            } else if (order.in_cashdro_transaction) {
                this.$('.next').addClass('oe_hidden');
                this.$('.in_cashdro_transaction').removeClass('oe_hidden');
                this.$('.cashdro-transaction-start').addClass('oe_hidden');
                this.$('.cashdro-transaction-cancel').removeClass('oe_hidden');
            } else {
                this.$('.next').removeClass('oe_hidden');
                this.$('.in_cashdro_transaction').addClass('oe_hidden');
                this.$('.cashdro-transaction-start').removeClass('oe_hidden');
                this.$('.cashdro-transaction-cancel').addClass('oe_hidden');
            }
        },

        cashdro_send_payment_request: function () {
            // The payment is done in three concatenated steps:
            // 1. The POS send a payment request, to which the Cashdro respondes
            //    with an operation id.
            // 2. Then the POS has to acknowledge that such operation id has
            //    been received.
            // 3. Once acknowledged the POS has to send a payment request to the
            //    cashdro. Once the Cashdro responses with a "F" state (for
            //    finished) we'll get the response and fill the tendered money
            //    for the payment line.
            var _this = this;
            var order = this.pos.get_order()
            var payment_line = order.selected_paymentline;
            // Cashdro treats decimals as positions in an integer we also have
            // to deal with floating point computing to avoid decimals at the
            // end or the drawer will reject our request.
            var amount = parseInt(order.get_due(payment_line).toFixed(2) * 100);
            var url = this._cashdro_payment_url({"amount": amount});
            var operation_id = "";
            var request = this._cashdro_request(url)
                .then(function (res) {
                    // It comes handy to log the response from the drawer, as
                    // we can diagnose the right sytmoms for each issue
                    console.log(res);
                    operation_id = res.data;
                    _this.pos.get_order().cashdro_operation = operation_id;
                    // Acknowledge the operation
                    var ack_url = _this._cashdro_ack_url(operation_id);
                    return _this._cashdro_request(ack_url);
                })
                .then(function (res_ack) {
                    // Validate the operation
                    console.log(res_ack);
                    var ask_url = _this._cashdro_ask_url(operation_id);
                    return _this._cashdro_request_payment(ask_url);
                })
                .then(function (operation_data) {
                    // This might be too verbose, but it helps a lot to diagnose
                    // issues and their reasons.
                    console.log(operation_data);
                    var data = JSON.parse(operation_data.data);
                    payment_line.cashdro_operation_data = data;
                    _this.pos.get_order().in_cashdro_transaction = false;
                    var tendered = data.operation.totalin / 100;
                    payment_line.set_amount(tendered)
                });
            return request;
        },

        cashdro_finish_operation: function (operation) {
            // Finish the Cashdro running operation
            var _this = this
            var order = this.pos.get_order()
            if (operation) {
                this._cashdro_request(this._cashdro_finish_url(operation))
                .then(function () {
                    order.in_cashdro_transaction = false;
                    order.cashdro_operation = false;
                    order.in_cashdro_transaction = false;
                    _this.order_changes();
                });
            }
        },

        // API communication methods

        _cashdro_url: function () {
            // Cashdro machines don't support safe POST calls, so we're sending
            // all the data quite unsafely constantly...
            var cashdro_host = this.journal && this.journal.cashdro_host;
            if (!cashdro_host) {
                return false;
            }
            var url = "https://" + cashdro_host + "/Cashdro3WS/index.php?";
            url += "name=" + this.journal.cashdro_user;
            url += "&password=" + this.journal.cashdro_password;
            return url;
        },

        _cashdro_payment_url: function(parameters) {
            // Compose the url for a sale report to Cashdro
            var url = this._cashdro_url()
            url += "&operation=startOperation&type=4";
            url += "&posid=pos-" + this.pos.pos_session.name;
            url += "&posuser=" + this.pos.get_cashier().id;
            url += "&parameters=" + JSON.stringify(parameters);
            return url;
        },

        _cashdro_ack_url: function(operation_id) {
            // Compose the url for a sale report to Cashdro
            var url = this._cashdro_url()
            url += "&operation=acknowledgeOperationId";
            url += "&operationId=" + operation_id;
            return url;
        },

        _cashdro_ask_url: function(operation_id) {
            // Compose the url for to report a sale to Cashdro
            var url = this._cashdro_url()
            url += "&operation=askOperation";
            url += "&operationId=" + operation_id;
            return url;
        },

        _cashdro_finish_url: function(operation_id) {
            // Compose the url for a sale report to Cashdro
            var url = this._cashdro_url()
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
                }
            });
        },

        _cashdro_request_payment: function (url) {
            // This is a special request, as we keep requesting the CashDro
            // until we get the *finished* state that will give us the amount
            // received in the cashdrawer.
            var def = $.Deferred();
            var _request_payment = function(url) {
              $.ajax({
                  url: url,
                  method: "GET",
                  success: function (response) {
                      var data = JSON.parse(response.data);
                      if (data.operation.state === "F") {
                          def.resolve(response);
                      } else {
                          _request_payment(url);
                      }
                  }
              });
            }
            _request_payment(url);
            return def;
        },


        _show_error: function (msg, title) {
            if (!title) {
                title =  _t("CashDro Error");
            }
            this.pos.gui.show_popup("error", {
                "title": title,
                "body": msg,
            });
        },

        // These methods should be covered in v13 with the new payment methods

        _get_journal: function (line_cid) {
            var line;
            var order = this.pos.get_order();
            var lines = order.get_paymentlines();
            for ( var i = 0; i < lines.length; i++ ) {
                if (lines[i].cid === line_cid) {
                    line = lines[i];
                }
            }
            return line.cashregister.journal
        },
        _cancel_current_transaction_popup: function () {
            var self = this;
            this.gui.show_popup("confirm",{
                title: _t("Transaction ongoing"),
                body:  _t("There is a transaction in progress, would you like to cancel it?"),
                confirm: function () {
                    self._cancel_current_transaction()
                },
                cancel: function () {
                    return;
                }
            });
        },

    });

});
