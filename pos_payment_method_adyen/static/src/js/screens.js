odoo.define('pos_payment_method_adyen.screens', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');
    var core = require('web.core');
    var rpc = require('web.rpc');

    var QWeb = core.qweb;

    var receiptFields = [
        'Card',
        'PAN Seq.',
        'Card type',
        'AID',
        'MID',
        'Auth. code',
        'Tender',
        'TOTAL',
    ]

    screens.PaymentScreenWidget.include({

        process_payment_terminal: function (line_cid) {
            this._super.apply(this, arguments);
            if (this.journal.use_payment_terminal == "adyen") {
                var isRefund = this.pos.get_order().selected_paymentline.amount < 0;
                if (!isRefund) {
                    this.adyen_send_payment_request();
                } else {
                    this.adyen_send_refund_request();
                }
                // TODO: Move this to Hobbii specific module
                // this.adyen_show_virtual_receipt();
            }
        },

        cancel_payment_terminal: function (line_cid) {
            this._super.apply(this, arguments);
            if (this.journal.use_payment_terminal == "adyen") {
                this.adyen_send_payment_cancel();
            }
        },

        adyen_send_payment_request: function () {
            var self = this;
            this.use_payment_token = false;
            this.shopperReference = null;
            this._reset_state();
            // Check if we can store customer card token
            this._check_create_new_customer_profile()
        },
        adyen_send_refund_request: function () {
            this._reset_state();
            return this._adyen_refund();
        },
        adyen_send_payment_cancel: function (order, cid) {
            // set only if we are polling
            this.was_cancelled = !!this.polling;
            return this._adyen_cancel();
        },
        close: function () {
            this._super.apply(this, arguments);
        },

        // private methods
        _reset_state: function () {
            this.was_cancelled = false;
            this.last_diagnosis_service_id = false;
            this.remaining_polls = 2;
            clearTimeout(this.polling);
        },

        _check_create_new_customer_profile: function () {
            // We create a new customer profile if:
            // - Active Shopper Recognition is enabled in the PoS Config
            // - The partner is set
            // - The partner has the field pos_payment_token empty
            var partner = this.pos.get_client();
            if (this.pos.config.active_shopper_recognition && partner && partner.pos_payment_token !== "0") {
                if (partner.pos_payment_token === "") {
                    // We only store the customer information if he/she agrees
                    this._ask_client_confirmation(partner);
                } else {
                    this.use_payment_token = true;
                    this._adyen_card_acquisition();
                }
            } else {
                this._adyen_pay();
            }
        },

        _handle_odoo_connection_failure: function (data) {
            // handle timeout
            var line = this.pos.get_order().selected_paymentline;
            this._show_error(_('Could not connect to the Odoo server, please check your internet connection and try again.'));

            return Promise.reject(data); // prevent subsequent onFullFilled's from being called
        },

        _call_adyen: function (data) {
            var self = this;
            return rpc.query({
                model: 'account.journal',
                method: 'proxy_adyen_request',
                args: [data, this.journal.adyen_test_mode, this.journal.adyen_api_key],
            }, {
                // When a payment terminal is disconnected it takes Adyen
                // a while to return an error (~6s). So wait 10 seconds
                // before concluding Odoo is unreachable.
                timeout: 10000,
                shadow: true,
            }).fail(function () {
                self._handle_odoo_connection_failure.bind(self)
            });
        },

        _adyen_get_sale_id: function () {
            var config = this.pos.config;
            return _.str.sprintf('%s (ID: %s)', config.display_name, config.id);
        },

        _adyen_common_message_header: function () {
            this.most_recent_service_id = Math.floor(Math.random() * Math.pow(2, 64)).toString(); // random ID to identify request/response pairs
            this.most_recent_service_id = this.most_recent_service_id.substring(0, 10); // max length is 10

            return {
                'ProtocolVersion': '3.0',
                'MessageClass': 'Service',
                'MessageType': 'Request',
                'SaleID': this._adyen_get_sale_id(),
                'ServiceID': this.most_recent_service_id,
                'POIID': this.journal.adyen_terminal_identifier
            };
        },

        _adyen_receipt_render_env: function () {
            return {}
        },

        // ADYEN Card Acquisition

        _adyen_card_acquisition_data: function () {
            var order = this.pos.get_order();
            var line = order.selected_paymentline;
            var data = {
                'SaleToPOIRequest': {
                    'MessageHeader': _.extend(this._adyen_common_message_header(), {
                        'MessageCategory': 'CardAcquisition',
                    }),
                    'CardAcquisitionRequest': {
                        'SaleData': {
                            'SaleTransactionID': {
                                'TransactionID': order.uid,
                                'TimeStamp': moment().format(), // iso format: '2018-01-10T11:30:15+00:00'
                            },
                            'TokenRequestedType': 'Customer'
                        },
                        'CardAcquisitionTransaction': {
                            'TotalAmount': line.amount
                        }
                    }
                }
            }

            return data;
        },

        _adyen_card_acquisition: function () {
            var self = this;
            this.card_acquisition_transaction = true;
            var partner = this.pos.get_client();
            this.shopperReference = partner.id + Math.floor(Math.random() * Math.pow(2, 64)).toString();

            var data = this._adyen_card_acquisition_data();

            return this._call_adyen(data).then(function (data) {
                return self._adyen_handle_response(data);
            });
        },

        // ADYEN Payment

        _adyen_pay_data: function (timeStamp, transactionId) {
            var order = this.pos.get_order();
            var config = this.pos.config;
            var line = order.selected_paymentline;
            var data = {
                'SaleToPOIRequest': {
                    'MessageHeader': _.extend(this._adyen_common_message_header(), {
                        'MessageCategory': 'Payment',
                    }),
                    'PaymentRequest': {
                        'SaleData': {
                            'SaleTransactionID': {
                                'TransactionID': order.uid,
                                'TimeStamp': moment().format(), // iso format: '2018-01-10T11:30:15+00:00'
                            },
                            'TokenRequestedType': 'Customer'
                        },
                        'PaymentTransaction': {
                            'AmountsReq': {
                                'Currency': this.pos.currency.name,
                                'RequestedAmount': line.amount,
                            }
                        }
                    }
                }
            };

            if (this.use_payment_token) {
                var partner = this.pos.get_client();
                var partner_email = partner.email;
                data['SaleToPOIRequest']['PaymentRequest']['SaleData']['SaleToAcquirerData'] = 'shopperEmail=' + partner_email + '&shopperReference=' + this.shopperReference;
                data['SaleToPOIRequest']['PaymentRequest']['PaymentData'] = {
                    'CardAcquisitionReference': {
                        'TimeStamp': timeStamp ? timeStamp : moment().format(),
                        'TransactionID': transactionId ? transactionId : order.uid,
                    }
                };
            }

            return data;
        },

        _adyen_pay: function (timestamp=false, transactionId=false) {
            var self = this;

            if (this.pos.get_order().selected_paymentline.amount < 0) {
                this._show_error(_('Cannot process transactions with negative amount.'));
                return Promise.resolve();
            }

            var data = this._adyen_pay_data(timestamp, transactionId);

            return this._call_adyen(data).then(function (data) {
                return self._adyen_handle_response(data);
            });
        },

        // ADYEN Refund

        _adyen_refund_data: function () {
            var order = this.pos.get_order();
            var config = this.pos.config;
            var line = order.selected_paymentline;
            var data = {
                'SaleToPOIRequest': {
                    'MessageHeader': _.extend(this._adyen_common_message_header(), {
                        'MessageCategory': 'Payment',
                    }),
                    'PaymentRequest': {
                        'SaleData': {
                            'SaleTransactionID': {
                                'TransactionID': order.uid,
                                'TimeStamp': moment().format(), // iso format: '2018-01-10T11:30:15+00:00'
                            }
                        },
                        'PaymentTransaction': {
                            'AmountsReq': {
                                'Currency': this.pos.currency.name,
                                'RequestedAmount': (-1) * line.amount,
                            }
                        },
                        'PaymentData': {
                            'PaymentType': 'Refund',
                        }
                    }
                }
            };

            return data;
        },

        _adyen_refund: function () {
            var self = this;

            var data = this._adyen_refund_data();

            return this._call_adyen(data).then(function (data) {
                return self._adyen_handle_response(data);
            });
        },

        // ADYEN Cancel

        _adyen_cancel: function (ignore_error) {
            var self = this;
            var previous_service_id = this.most_recent_service_id;
            var header = _.extend(this._adyen_common_message_header(), {
                'MessageCategory': 'Abort',
            });

            var data = {
                'SaleToPOIRequest': {
                    'MessageHeader': header,
                    'AbortRequest': {
                        'AbortReason': 'MerchantAbort',
                        'MessageReference': {
                            'MessageCategory': 'Payment',
                            'SaleID': header.SaleID,
                            'ServiceID': previous_service_id,
                        }
                    },
                }
            };

            return this._call_adyen(data).then(function (data) {

                // Only valid response is a 200 OK HTTP response which is
                // represented by true.
                if (! ignore_error && data !== true) {
                    self._show_error(_('Cancelling the payment failed. Please cancel it manually on the payment terminal.'));
                }
            });
        },

        // ADYEN Helper

        _convert_receipt_info: function (output_text) {
            return output_text.reduce(function (acc, entry) {
                var params = new URLSearchParams(entry.Text);

                if (params.get('name') && !params.get('value')) {
                    return acc + _.str.sprintf('<br/>%s', params.get('name'));
                } else if (params.get('name') && params.get('value')) {
                    return acc + _.str.sprintf('<br/>%s: %s', params.get('name'), params.get('value'));
                }

                return acc;
            }, '');
        },

        _convert_receipt_info_dict: function (output_text) {
            var receiptInfo = [];
            _.each(output_text, function (entry) {
                var params = new URLSearchParams(entry.Text);

                var name = params.get('name');
                var value = params.get('value');

                if (name && receiptFields.includes(name) && value) {
                    receiptInfo.push(_.str.sprintf('%s: %s', name, value))
                }
            });
            return receiptInfo;
        },

        // ADYEN Notification management

        _poll_for_response: function (resolve, reject) {
            var self = this;
            if (this.was_cancelled) {
                resolve(false);
                return Promise.resolve();
            }

            return rpc.query({
                model: 'account.journal',
                method: 'get_latest_adyen_status',
                args: [this.journal.id,
                       this._adyen_get_sale_id(),
                       this.journal.adyen_terminal_identifier,
                       this.journal.adyen_test_mode,
                       this.journal.adyen_api_key],
            }, {
                timeout: 5000,
                shadow: true,
            }).fail(function (data) {
                reject();
                return self._handle_odoo_connection_failure(data);
            }).then(function (status) {
                var notification = status.latest_response;
                var last_diagnosis_service_id = status.last_received_diagnosis_id;
                var order = self.pos.get_order();
                var line = order.selected_paymentline;


                if (self.last_diagnosis_service_id != last_diagnosis_service_id) {
                    self.last_diagnosis_service_id = last_diagnosis_service_id;
                    self.remaining_polls = 2;
                } else {
                    self.remaining_polls--;
                }

                if (notification && notification.SaleToPOIResponse.MessageHeader.ServiceID == self.most_recent_service_id) {
                    if (self.card_acquisition_transaction) {
                        var response = notification.SaleToPOIResponse.CardAcquisitionResponse.Response;
                    } else {
                        var response = notification.SaleToPOIResponse.PaymentResponse.Response;
                    }
                    var additional_response = new URLSearchParams(response.AdditionalResponse);

                    if (response.Result == 'Success') {
                        if (self.card_acquisition_transaction) {
                            var card_acquisition_response = notification.SaleToPOIResponse.CardAcquisitionResponse;
                            var poi_transaction_id = card_acquisition_response.POIData.POITransactionID;
                            var timeStamp = poi_transaction_id.TimeStamp;
                            var transactionId = poi_transaction_id.TransactionID;

                            var shopperReference = additional_response.get('shopperReference');
                            self.card_acquisition_transaction = false;
                            var partner_reference = self.pos.get_client().pos_payment_token;
                            if (shopperReference) {
                                if (!partner_reference || partner_reference != shopperReference) {
                                    self._rpc({
                                        model: 'res.partner',
                                        method: 'write',
                                        args: [self.pos.get_client().id, {pos_payment_token: shopperReference}],
                                    }).then(function () { self._adyen_pay(timeStamp, transactionId); });
                                } else {
                                    self._adyen_pay(timeStamp, transactionId);
                                }
                            } else {
                                self._rpc({
                                    model: 'res.partner',
                                    method: 'write',
                                    args: [self.pos.get_client().id, {pos_payment_token: self.shopperReference}],
                                }).then(function () { self._adyen_pay(timeStamp, transactionId); });
                            }
                        } else {
                            var payment_response = notification.SaleToPOIResponse.PaymentResponse;
                            var payment_result = payment_response.PaymentResult;
                            // Check if there is receipt
                            var customer_receipt = payment_response.PaymentReceipt.find(function (receipt) {
                                return receipt.DocumentQualifier == 'CustomerReceipt';
                            });

                            if (customer_receipt) {
                                line.ticket = self._convert_receipt_info(customer_receipt.OutputContent.OutputText);
                                line.card_receipt = self._convert_receipt_info_dict(customer_receipt.OutputContent.OutputText);
                            }

                            var config = this.pos.config;
                            // If passive shopper recognition is enabled store data of transaction
                            if (config.passive_shopper_recognition) {
                                // TODO: finish this
                            }

                            self.validate_order();
                            resolve(true);
                        }
                    } else {
                        var message = additional_response.get('message');
                        self._show_error(_.str.sprintf(_t('Message from Adyen: %s'), message));

                        // this means the transaction was cancelled by pressing the cancel button on the device
                        if (message.startsWith('108 ')) {
                            resolve(false);
                        } else {
                            reject();
                        }
                    }
                } else if (self.remaining_polls <= 0) {
                    self._show_error(_t('The connection to your payment terminal failed. Please check if it is still connected to the internet.'));
                    self._adyen_cancel();
                    resolve(false);
                }
            });
        },

        _adyen_handle_response: function (response) {
            var line = this.pos.get_order().selected_paymentline;

            if (response.error && response.error.status_code == 401) {
                this._show_error(_t('Authentication failed. Please check your Adyen credentials.'));
                return Promise.resolve();
            }

            response = response.SaleToPOIRequest;
            if (response && response.EventNotification && response.EventNotification.EventToNotify == 'Reject') {
                console.error('error from Adyen', response);

                var msg = '';
                if (response.EventNotification) {
                    var params = new URLSearchParams(response.EventNotification.EventDetails);
                    msg = params.get('message');
                }

                this._show_error(_.str.sprintf(_t('An unexpected error occured. Message from Adyen: %s'), msg));

                return Promise.resolve();
            } else {

                var self = this;
                var res = new Promise(function (resolve, reject) {
                    // clear previous intervals just in case, otherwise
                    // it'll run forever
                    clearTimeout(self.polling);

                    self.polling = setInterval(function () {
                        self._poll_for_response(resolve, reject);
                    }, 3000);
                });

                // make sure to stop polling when we're done
                res.finally(function () {
                    self._reset_state();
                });

                return res;
            }
        },

        _ask_client_confirmation: function (partner) {
            var self = this;
            this.gui.show_popup('confirm',{
                title: _t('Please Confirm Client Agreement to Store Data'),
                body:  _t('Does client agrees on the storage of sensitive data in our system?'),
                confirm: function () {
                    self.store_user_token = true;
                    self._adyen_card_acquisition();
                },
                cancel: function () {
                    return self._rpc({
                        model: 'res.partner',
                        method: 'write',
                        args: [partner.id, {pos_payment_token: "0"}],
                    }).then(function () { self._adyen_pay(); });
                }
            });
        },

        _show_error: function (msg, title) {
            if (!title) {
                title =  _t('Adyen Error');
            }
            this.pos.gui.show_popup('error',{
                'title': title,
                'body': msg,
            });
        },

    });

});
