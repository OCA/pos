odoo.define('pos_payment_method_adyen.screens', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');
    var core = require('web.core');
    var rpc = require('web.rpc');

    var QWeb = core.qweb;

    screens.PaymentScreenWidget.include({

        // Methods called from user pressing the buttons in the UI

        process_payment_terminal: function (line_cid) {
            this._super.apply(this, arguments);
            if (this.journal.use_payment_terminal == "adyen") {
                var order = this.pos.get_order()
                // We check the amount, we do not allow going over the order amount
                if (this._valid_order_amount(order)) {
                    // We check if it's a refund or not
                    this.isRefund = order.selected_paymentline.amount < 0;
                    if (!this.isRefund) {
                        this.adyen_send_payment_request();
                    } else {
                        this.adyen_send_refund_request();
                    }
                } else {
                    this._show_error(_('You are not allowed to pay an amount greater than the order amount'));
                    order.in_transaction = false;
                    order.status = "draft";
                    this.order_changes();
                }
            }
        },

        cancel_payment_terminal: function (line_cid) {
            this._super.apply(this, arguments);
            if (this.journal.use_payment_terminal == "adyen") {
                this.adyen_send_payment_cancel();
            }
        },

        refresh_payment_status: function (line_cid) {
            this._super.apply(this, arguments);
            if (this.journal.use_payment_terminal == "adyen") {
                this.adyen_send_payment_status_update();
            }
        },

        // Methods to handle adyen requests (payment, refund, cancel, update)

        adyen_send_payment_request: function () {
            var self = this;
            this.use_payment_token = false;
            this.shopperReference = null;
            this._reset_state();
            // Check if we can store customer card token
            this._check_create_new_customer_profile()
        },
        adyen_send_refund_request: function () {
            this.use_payment_token = false;
            this.shopperReference = null;
            this._reset_state();
            return this._adyen_refund();
        },
        adyen_send_payment_cancel: function (order, cid) {
            // set only if we are polling
            this.was_cancelled = !!this.polling;
            return this._adyen_cancel();
        },
        adyen_send_payment_status_update: function (order, cid) {
            return this._adyen_update_payment_status(false);
        },

        // private methods

        _valid_order_amount: function (order) {
            var selected_paymentline = order.selected_paymentline;
            var order_amount_taxed = order.get_total_with_tax()
            var paymentline_amount = Math.round(selected_paymentline.amount * 100) / 100;
            var order_amount = Math.round(order_amount_taxed * 100) / 100;
            return paymentline_amount <= order_amount
        },

        _reset_state: function () {
            this.was_cancelled = false;
            this.last_diagnosis_service_id = false;
            this.remaining_polls = 3;
            this.allowed_failures = 3;
            clearTimeout(this.polling);
        },

        _check_create_new_customer_profile: function () {
            // We create a new customer profile if:
            // - Active Shopper Recognition is enabled in the PoS Config
            // - The partner is set
            // - The partner has the field pos_adyen_shopper_reference empty
            var partner = this.pos.get_client();
            if (this.pos.config.adyen_active_shopper_recognition && partner && partner.pos_adyen_shopper_reference !== "0") {
                if (partner.pos_adyen_shopper_reference == "") {
                    // We only store the customer information if he/she agrees
                    this._ask_client_confirmation(partner);
                } else {
                    if (this.pos.config.adyen_automated_payment) {
                        // If we have the token stored we ask for user to confirm we can use the token for the payment
                        this._make_online_payment(partner);
                    } else {
                        this.use_payment_token = true;
                        this._adyen_card_acquisition();
                    }
                }
            } else {
                this._adyen_pay();
            }
        },

        _handle_odoo_connection_failure: function (data) {
            // handle timeout
            var order = this.pos.get_order()
            var line = order.selected_paymentline;
            this._show_error(_('Could not connect to the Odoo server, please check your internet connection and try again.'));

            order.in_transaction = false;
            order.status = "error";
            this.order_changes();

            return Promise.reject(data); // prevent subsequent onFullFilled's from being called
        },

        _call_adyen_sync: function (data) {
            var self = this;
            return rpc.query({
                model: 'account.journal',
                method: 'proxy_adyen_request_sync',
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

        _adyen_common_message_header: function (storeServiceId) {
            var ranID = Math.floor(Math.random() * Math.pow(2, 64)).toString(); // random ID to identify request/response pairs
            var serviceId = ranID.substring(0, 10); // max length is 10

            if (storeServiceId) {
                this.most_recent_service_id = serviceId
            }

            return {
                'ProtocolVersion': '3.0',
                'MessageClass': 'Service',
                'MessageType': 'Request',
                'SaleID': this._adyen_get_sale_id(),
                'ServiceID': serviceId,
                'POIID': this.pos.config.adyen_terminal_identifier
            };
        },

        // ADYEN Card Acquisition

        _adyen_card_acquisition_data: function () {
            var order = this.pos.get_order();
            var line = order.selected_paymentline;
            var data = {
                'SaleToPOIRequest': {
                    'MessageHeader': _.extend(this._adyen_common_message_header(true), {
                        'MessageCategory': 'CardAcquisition',
                    }),
                    'CardAcquisitionRequest': {
                        'SaleData': {
                            'SaleTransactionID': {
                                'TransactionID': "Order " + order.uid,
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
            var newReference = partner.id + Math.floor(Math.random() * Math.pow(2, 64)).toString();
            this.shopperReference = partner.pos_adyen_shopper_reference ? partner.pos_adyen_shopper_reference : newReference;

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
                    'MessageHeader': _.extend(this._adyen_common_message_header(true), {
                        'MessageCategory': 'Payment',
                    }),
                    'PaymentRequest': {
                        'SaleData': {
                            'SaleTransactionID': {
                                'TransactionID': "Order " + order.uid,
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
                var SaleToAcquirerData = 'shopperEmail=' + partner_email + '&shopperReference=' + this.shopperReference;
                if (this.pos.config.adyen_automated_payment) {
                    SaleToAcquirerData += '&recurringContract=ONECLICK,RECURRING';
                }
                data['SaleToPOIRequest']['PaymentRequest']['SaleData']['SaleToAcquirerData'] = SaleToAcquirerData
                data['SaleToPOIRequest']['PaymentRequest']['PaymentData'] = {
                    'CardAcquisitionReference': {
                        'TimeStamp': timeStamp ? timeStamp : moment().format(),
                        'TransactionID': transactionId ? transactionId : order.uid,
                    }
                };
            }

            return data;
        },

        _adyen_automated_payment_data: function (partner) {
            var order = this.pos.get_order();
            var config = this.pos.config;
            var line = order.selected_paymentline;
            var data = {
                "amount": {
                    "value": line.amount * 100,
                    "currency": this.pos.currency.name,
                },
                "paymentMethod": {
                    "type": "scheme",
                    "storedPaymentMethodId": partner.pos_adyen_payment_token,
                },
                "reference": "Order " + order.uid,
                "shopperInteraction": "ContAuth",
                "recurringProcessingModel": "CardOnFile",
                "merchantAccount": this.journal.adyen_merchant_account,
                "shopperReference": partner.pos_adyen_shopper_reference,
            }
            return data
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
                    'MessageHeader': _.extend(this._adyen_common_message_header(true), {
                        'MessageCategory': 'Payment',
                    }),
                    'PaymentRequest': {
                        'SaleData': {
                            'SaleTransactionID': {
                                'TransactionID': "Order " + order.uid,
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
            var data = {
                'SaleToPOIRequest': {
                    'MessageHeader': _.extend(this._adyen_common_message_header(false), {
                        'MessageCategory': 'Abort',
                    }),
                    'AbortRequest': {
                        'AbortReason': 'MerchantAbort',
                        'MessageReference': {
                            'MessageCategory': 'Payment',
                            'SaleID': this._adyen_get_sale_id(),
                            'ServiceID': this.most_recent_service_id,
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
                self.pos.get_order().in_transaction = false;
                self.pos.get_order().status == "draft";
                self.order_changes();
            });
        },

        // ADYEN Update Payment Status

        _adyen_update_payment_status: function (retry) {
            var self = this;
            var data = {
                'SaleToPOIRequest': {
                    'MessageHeader': _.extend(this._adyen_common_message_header(false), {
                        'MessageCategory': 'TransactionStatus',
                    }),
                    'TransactionStatusRequest': {
                        'ReceiptReprintFlag': true,
                        'DocumentQualifier': [
                            'CashierReceipt',
                            'CustomerReceipt'
                        ],
                    },
                    'MessageReference': {
                        'SaleID': this._adyen_get_sale_id(),
                        'ServiceID': this.most_recent_service_id,
                        'MessageCategory': 'Payment'
                    }
                }
            }

            return this._call_adyen_sync(data).then(function (resp) {
                if (resp.SaleToPOIResponse && resp.SaleToPOIResponse.TransactionStatusResponse) {
                    var transactionStatusResponse = resp.SaleToPOIResponse.TransactionStatusResponse;
                    var response = transactionStatusResponse.Response;
                    var result = response.Result;
                    if (result == 'Success') {
                        var repeatedMessageResponse = transactionStatusResponse.RepeatedMessageResponse;
                        var paymentResponse = repeatedMessageResponse.RepeatedResponseMessageBody.PaymentResponse;
                        if (paymentResponse) {
                            self._manage_adyen_transaction_response(paymentResponse);
                        }
                    } else {
                        if (response.ErrorCondition != "InProgress" || retry) {
                            var message = response.AdditionalResponse;
                            self._show_error(_.str.sprintf(_t('Message from Adyen: %s'), message));
                            self.pos.get_order().in_transaction = false;
                            self.pos.get_order().status = "draft";
                            self.order_changes();
                        } else {
                            setTimeout(function () {
                                self._adyen_update_payment_status(true)
                            }, 2000);
                        }
                    }
                } else {
                    self._show_error(_('Could not connect to the Odoo server, check your internet connection and try again please.'));
                    self.pos.get_order().in_transaction = false;
                    self.pos.get_order().status = "error";
                    self.order_changes();
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

                if (name && value) {
                    receiptInfo.push(_.str.sprintf('%s: %s', name, value))
                }
            });
            return receiptInfo;
        },

        _update_shopper_reference: function (shopperReference) {
            var self = this;
            return this._rpc({
                model: 'res.partner',
                method: 'write',
                args: [self.pos.get_client().id, {pos_adyen_shopper_reference: shopperReference}],
            })
        },

        _update_shopper_recurring_token: function (shopperRecurringToken) {
            var self = this;
            return this._rpc({
                model: 'res.partner',
                method: 'write',
                args: [self.pos.get_client().id, {pos_adyen_payment_token: shopperRecurringToken}],
            })
        },

        _update_shopper_details: function (additionalResponse) {
            var self = this;
            var shopperRecurringToken = '';
            if (self.pos.config.adyen_automated_payment) {
                shopperRecurringToken = additionalResponse.get('recurring.recurringDetailReference');
            }
            // We check expiration of card so we don't use it after it has been expired, otherwise we set an expiration
            // of the token to 1 year.
            var expiryMonth = additionalResponse.get('expiryMonth');
            var expiryYear = additionalResponse.get('expiryYear');
            var expiryDay = new Date(expiryYear, expiryMonth, 0).getDate();
            var expiryDate = '';
            if (expiryDay && expiryMonth && expiryYear) {
                expiryDate = expiryYear + '-' + expiryMonth + '-' + expiryDay;
            }
            // Card details that will be shown upon further payments
            var cardDetails = {
                "paymentMethod": additionalResponse.get('paymentMethod'),
                "cardSummary": additionalResponse.get('cardSummary'),
                "fundingSource": additionalResponse.get('fundingSource'),
                "expiryDate": additionalResponse.get('expiryDate').split('%2f').join('-'),
            }
            // Data to update in the partner
            var data = {
                pos_adyen_payment_token: shopperRecurringToken,
                pos_adyen_card_details: cardDetails,
                pos_adyen_payment_token_expiration: expiryDate,
            }
            return this._rpc({
                model: 'res.partner',
                method: 'write',
                args: [self.pos.get_client().id, data],
            })
        },

        _delete_shopper_data: function () {
            var data = {
                pos_adyen_shopper_reference: false,
                pos_adyen_payment_token: false,
                pos_adyen_card_details: false,
                pos_adyen_payment_token_expiration: false,
            }
            return this._rpc({
                model: 'res.partner',
                method: 'write',
                args: [self.pos.get_client().id, data],
            })
        },

        _manage_card_acquisition_response: function (CardAcquisitionResponse) {
            var self = this;
            self.card_acquisition_transaction = false;

            var response = CardAcquisitionResponse.Response;
            var additionalResponse = new URLSearchParams(response.AdditionalResponse);
            var cardAcquisitionResponse = CardAcquisitionResponse;
            var poiTransactionId = cardAcquisitionResponse.POIData.POITransactionID;
            var timeStamp = poiTransactionId.TimeStamp;
            var transactionId = poiTransactionId.TransactionID;
            var shopperReference = additionalResponse.get('shopperReference');
            var storedReference = self.pos.get_client().pos_adyen_shopper_reference;

            // If we get a shopper reference from the request we check if we have the same value in Odoo
            // if not we update it. If we do not get a shopper reference we write our generated one.
            if (shopperReference) {
                if (!storedReference || storedReference != shopperReference) {
                    self._update_shopper_reference(shopperReference).then(function () {
                        self._adyen_pay(timeStamp, transactionId);
                    });
                } else {
                    self._adyen_pay(timeStamp, transactionId);
                }
            } else {
                self._update_shopper_reference(self.shopperReference).then(function () {
                    self._adyen_pay(timeStamp, transactionId);
                });
            }
        },

        _manage_adyen_transaction_response: function (PaymentResponse) {
            var self = this;
            var order = self.pos.get_order();
            var line = order.selected_paymentline;
            var response = PaymentResponse.Response;
            var additionalResponse = new URLSearchParams(response.AdditionalResponse);

            var paymentResponse = PaymentResponse;

            // Check if there is receipt
            var customerReceipt = paymentResponse.PaymentReceipt.find(function (receipt) {
                return receipt.DocumentQualifier == 'CustomerReceipt';
            });

            if (customerReceipt) {
                line.ticket = self._convert_receipt_info(customerReceipt.OutputContent.OutputText);
                line.card_receipt = self._convert_receipt_info_dict(customerReceipt.OutputContent.OutputText);
            }

            var config = this.pos.config;
            // If passive shopper recognition is enabled store the card details on the order
            if (config.adyen_passive_shopper_recognition) {
                order.customer_card_alias = additionalResponse.get('alias') || '';
                order.customer_card_country_code = additionalResponse.get('issuerCountry') || '';
                order.customer_card_country_iso = additionalResponse.get('cardIssuerCountryId') || '';
                order.customer_card_funding_source = additionalResponse.get('fundingSource') || '';
            }
            if (self.use_payment_token && !self.isRefund) {
                // Store shopper details
                self._update_shopper_details(additionalResponse);
            }

            self._post_process_response();
        },

        _manage_adyen_online_payment_response: function (notification) {
            var self = this;
            var order = self.pos.get_order();
            var line = order.selected_paymentline;
            var response = notification.additionalData;

            if (notification.errorCode) {
                var message = notification.message;
                self._show_error(_.str.sprintf(_t('Message from Adyen: %s'), message));
                return
            }

            if (notification.resultCode != 'Authorised') {
                var message = 'Payment failed for unknown reasons';
                self._show_error(_.str.sprintf(_t('Message from Odoo: %s'), message));
                return
            }

            var receiptFields = ["cardSummary", "recurringProcessingModel", "acquirerReference", "authCode",
                                 "authorisedAmountValue", "authorisedAmountCurrency", "fundingSource"];

            if (response) {
                var receiptInfo = [];
                for (var key in response) {
                    var name = key;
                    var value = response[key];

                    if (name && value && receiptFields.includes(name)) {
                        if (name == "authorisedAmountValue") {
                            value = (parseInt(value, 10) / 100).toFixed(2);
                        } else if (name == "cardSummary") {
                            value = "************" + value;
                        }
                        name = name.charAt(0).toUpperCase() + name.slice(1);
                        receiptInfo.push(_.str.sprintf('%s: %s', name.split(/(?=[A-Z])/).join(' '), value))
                    }
                }
                line.card_receipt = receiptInfo;
            }

            self._post_process_response();
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
                       this.pos.config.adyen_terminal_identifier,
                       this.journal.adyen_test_mode,
                       this.journal.adyen_api_key],
            }, {
                timeout: 5000,
                shadow: true,
            }).fail(function (data) {
                self.allowed_failures--;
                if (self.allowed_failures <= 0) {
                    reject();
                    return self._handle_odoo_connection_failure(data);
                }
            }).then(function (status) {
                var notification = status.latest_response;
                var last_diagnosis_service_id = status.last_received_diagnosis_id;
                var order = self.pos.get_order();


                if (self.last_diagnosis_service_id != last_diagnosis_service_id) {
                    self.last_diagnosis_service_id = last_diagnosis_service_id;
                    self.remaining_polls = 3;
                } else {
                    self.remaining_polls--;
                }

                if (notification && notification.SaleToPOIResponse.MessageHeader.ServiceID == self.most_recent_service_id) {
                    if (self.card_acquisition_transaction) {
                        var transactionResponse = notification.SaleToPOIResponse.CardAcquisitionResponse;
                    } else {
                        var transactionResponse = notification.SaleToPOIResponse.PaymentResponse;
                    }
                    var response = transactionResponse.Response
                    if (response.Result == 'Success') {
                        // We treat differently the response if we come from a card acquisition transaction or from a
                        // payment transaction
                        if (self.card_acquisition_transaction) {
                            self._manage_card_acquisition_response(transactionResponse)
                        } else {
                            self._manage_adyen_transaction_response(transactionResponse)
                            resolve(true);
                        }
                    } else {
                        var additionalResponse = new URLSearchParams(response.AdditionalResponse);
                        var message = additionalResponse.get('message');
                        self._show_error(_.str.sprintf(_t('Message from Adyen: %s'), message));
                        self.pos.get_order().in_transaction = false;
                        self.order_changes();

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
                    self.pos.get_order().in_transaction = false;
                    self.pos.get_order().status = "error"
                    self.order_changes();
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

        _post_process_response: function () {
            var order = this.pos.get_order();
            order.in_transaction = false;
            order.status = "done";
            this.order_changes();
            this.validate_order();
        },

        // POPUPS

        _ask_client_confirmation: function (partner) {
            var self = this;
            this.gui.show_popup('confirm',{
                title: _t('Please Confirm Client Agreement to Store Data'),
                body:  _t('Does client agrees on the storage of sensitive data in our system?'),
                confirm: function () {
                    self.use_payment_token = true;
                    self._adyen_card_acquisition();
                },
                cancel: function () {
                    return self._rpc({
                        model: 'res.partner',
                        method: 'write',
                        args: [partner.id, {pos_adyen_shopper_reference: "0"}],
                    }).then(function () { self._adyen_pay(); });
                }
            });
        },

        _make_online_payment: function (partner) {
            var self = this;
            this.gui.show_popup('automatedPayment',{
                title: _t('Automated payment with stored token'),
                body:  _t('Does client agrees on using previously stored token for the payment?'),
                data:  partner.pos_adyen_card_details,
                confirm: function () {
                    var data = self._adyen_automated_payment_data(partner);
                    return rpc.query({
                        model: 'account.journal',
                        method: 'adyen_make_payment_request',
                        args: [data, self.journal.adyen_test_mode, self.journal.adyen_api_key],
                    }, {
                        // When a payment terminal is disconnected it takes Adyen
                        // a while to return an error (~6s). So wait 10 seconds
                        // before concluding Odoo is unreachable.
                        timeout: 10000,
                        shadow: true,
                    }).fail(function () {
                        self._handle_odoo_connection_failure.bind(self)
                    }).then(function (res) {
                        self._manage_adyen_online_payment_response(res);
                    });
                },
                cancel: function () {
                    self._adyen_pay();
                },
                cancel_remove: function () {
                    // What do we remove here? Everything?
                    self._delete_shopper_data()
                    self._adyen_pay();
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
