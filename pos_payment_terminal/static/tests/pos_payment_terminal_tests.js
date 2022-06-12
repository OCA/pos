odoo.define("pos_payment_terminal.pos_payment_terminal_tests", function (require) {
    "use strict";

    /* global QUnit */

    var OCAPaymentTerminal = require("pos_payment_terminal.payment");

    require("web.test_utils");
    const Session = require("web.Session");
    const makePosTestEnv = require("point_of_sale.test_env");

    const promiseTimeout = function (ms, promise) {
        // Create a promise that rejects in <ms> milliseconds
        const timeout = new Promise((resolve, reject) => {
            const id = setTimeout(() => {
                clearTimeout(id);
                reject("Timed out in " + ms + "ms.");
            }, ms);
        });

        // Returns a race between our timeout and the passed in promise
        return Promise.race([promise, timeout]);
    };

    const pinPM = {
        id: 0,
        name: "PIN",
        is_cash_count: false,
        use_payment_terminal: true,
    };

    QUnit.module(
        "pos_payment_terminal",
        {
            beforeEach: function (assert) {
                assert.expect(6);

                // Create POS test environment
                const env = makePosTestEnv();
                assert.ok(env);
                assert.ok(env.pos);
                env.pos.proxy.connection = new Session(undefined, "", {use_cors: true});
                env.pos.proxy.set_connection_status("connected");

                // Create OCA payment terminal object
                const payment_terminal = new OCAPaymentTerminal(env.pos, pinPM);
                assert.ok(payment_terminal);
                assert.ok(payment_terminal.pos);
                payment_terminal._show_error = function (msg) {
                    console.log("Would have shown error: ", msg);
                };

                // Get current order
                const order = env.pos.get_order();
                assert.ok(order);

                // Add some orderlines to create a nonzero amount
                const chair1 = env.pos.db.search_product_in_category(
                    0,
                    "Office Chair"
                )[0];
                order.add_product(chair1);

                // Add payment line and select it
                const paymentline1 = order.add_paymentline(pinPM);
                assert.ok(order.paymentlines.length === 1);
                order.select_paymentline(paymentline1);

                // Share variables with the tests.
                this.env = env;
                this.order = order;
                this.payment_terminal = payment_terminal;
                this.paymentline1 = paymentline1;
            },

            afterEach: function () {
                // NOTE: if this fails to get called, the only way to repair the tests
                // is to go in Chrome inspection tools, Application, Local Storage and deleting openerp_*_unpaid*
                this.order.remove_paymentline(this.paymentline1);
                this.env.pos.delete_current_order();
            },
        },
        function () {
            QUnit.test("Happy flow - Successful PIN transaction", async function (
                assert
            ) {
                assert.expect(7);
                var self = this;

                self.env.pos.proxy.connection.rpc = async function (
                    url,
                    params,
                    options
                ) {
                    console.log("MOCK CALL TO", url, params, options);
                    // We get back a transaction ID, that we can then poll for
                    if (url === "/hw_proxy/payment_terminal_transaction_start") {
                        return new Promise((resolve) => {
                            resolve({transaction_id: "X1234"});
                        });
                    } else if (url.startsWith("/hw_proxy/status_json")) {
                        return new Promise(async (resolve) => {
                            resolve({
                                test_driver: {
                                    is_terminal: true,
                                    transactions: [
                                        {
                                            transaction_id: "X1234",
                                            success: true,
                                            status: "SUCCESS",
                                            status_details: "Pretty successful",
                                        },
                                    ],
                                },
                            });
                        });
                    }
                    console.log("Unexpected call, ignoring");
                };
                var done = assert.async();
                self.payment_terminal.send_payment_request().then(function () {
                    assert.ok(self.paymentline1.terminal_transaction_success);
                    done();
                });
            });

            QUnit.test("Sad flow 1 - Failure reported by PIN machine", async function (
                assert
            ) {
                assert.expect(7);
                var self = this;

                self.env.pos.test_no_console_error = true;
                self.env.pos.proxy.connection.rpc = async function (
                    url,
                    params,
                    options
                ) {
                    console.log("MOCK CALL TO", url, params, options);
                    if (url === "/hw_proxy/payment_terminal_transaction_start") {
                        return new Promise((resolve) => {
                            resolve({transaction_id: "X1234"});
                        });
                    } else if (url.startsWith("/hw_proxy/status_json")) {
                        return new Promise(async (resolve) => {
                            resolve({
                                test_driver: {
                                    is_terminal: true,
                                    transactions: [
                                        {
                                            transaction_id: "X1234",
                                            success: false,
                                            status: "FAILURE",
                                            status_details: "Pretty unsuccessful",
                                        },
                                    ],
                                },
                            });
                        });
                    }
                    console.log("Unexpected call, ignoring");
                };
                var done = assert.async();
                self.payment_terminal.send_payment_request().then(function () {
                    assert.notOk(self.paymentline1.terminal_transaction_success);
                    done();
                });
            });

            QUnit.test("Sad flow 2 - Cancellation by user", async function (assert) {
                assert.expect(7);
                var self = this;

                self.env.pos.test_no_console_error = true;
                self.env.pos.proxy.connection.rpc = async function (
                    url,
                    params,
                    options
                ) {
                    console.log("MOCK CALL TO", url, params, options);
                    if (url === "/hw_proxy/payment_terminal_transaction_start") {
                        return new Promise((resolve) => {
                            resolve({transaction_id: "X1234"});
                        });
                    } else if (url.startsWith("/hw_proxy/status_json")) {
                        // Simulate what the user 'Cancel' button does
                        this.payment_terminal.send_payment_cancel(
                            this.order,
                            this.paymentline1.cid
                        );
                        // Meanwhile return an undefined result for the transaction, to keep polling
                        return new Promise((resolve) => {
                            resolve({
                                test_driver: {
                                    is_terminal: true,
                                    transactions: [],
                                },
                            });
                        });
                    }
                    console.log("Unexpected call, ignoring");
                };
                await assert.rejects(this.payment_terminal.send_payment_request());
            });

            QUnit.test("Sad flow 3 - Timeout in POSbox response", async function (
                assert
            ) {
                assert.expect(7);
                var self = this;

                self.env.pos.test_no_console_error = true;
                self.env.pos.proxy.connection.rpc = async function (
                    url,
                    params,
                    options
                ) {
                    console.log("MOCK CALL TO", url, params, options);
                    // We get back a transaction ID, that we can then poll for
                    if (url === "/hw_proxy/payment_terminal_transaction_start") {
                        return new Promise((resolve) => {
                            resolve({transaction_id: "X1234"});
                        });
                    } else if (url.startsWith("/hw_proxy/status_json")) {
                        return promiseTimeout(
                            options.timeout,
                            new Promise(async (resolve) => {
                                // Too long! > 1000 ms
                                await new Promise((r) => setTimeout(r, 10000));
                                resolve({
                                    test_driver: {
                                        is_terminal: true,
                                        transactions: [
                                            {
                                                transaction_id: "X1234",
                                                success: true,
                                                status: "SUCCESS",
                                                status_details: "Pretty successful",
                                            },
                                        ],
                                    },
                                });
                            })
                        );
                    }
                    console.log("Unexpected call, ignoring");
                };
                assert.rejects(self.payment_terminal.send_payment_request());
            });

            QUnit.test(
                "Sad flow 4 - global timeout - transaction result never comes",
                async function (assert) {
                    assert.expect(7);
                    var self = this;
                    self.payment_terminal.global_timeout = 5;
                    self.env.pos.test_no_console_error = true;
                    self.env.pos.proxy.connection.rpc = async function (
                        url,
                        params,
                        options
                    ) {
                        console.log("MOCK CALL TO", url, params, options);
                        // We get back a transaction ID, that we can then poll for
                        if (url === "/hw_proxy/payment_terminal_transaction_start") {
                            return new Promise((resolve) => {
                                resolve({transaction_id: "X1234"});
                            });
                        } else if (url.startsWith("/hw_proxy/status_json")) {
                            return new Promise(async (resolve) => {
                                await new Promise((r) => setTimeout(r, 800));
                                resolve({
                                    test_driver: {
                                        is_terminal: true,
                                        transactions: [],
                                    },
                                });
                            });
                        }
                        console.log("Unexpected call, ignoring");
                    };
                    assert.rejects(self.payment_terminal.send_payment_request());
                }
            );
        }
    );
});
