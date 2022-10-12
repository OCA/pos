odoo.define("pos_cash_control.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");
    const round_decimals = require("web.utils").round_decimals;

    models.load_models([
        {
            model: "pos.bill",
            fields: ["name", "value"],
            domain: function (self) {
                return [["id", "in", self.config.default_bill_ids]];
            },
            loaded: function (self, bills) {
                self.bills = bills;
            },
        },
    ]);

    models.PosModel = models.PosModel.extend({
        async getClosePosInfo() {
            try {
                const closingData = await this.env.services.rpc({
                    model: "pos.session",
                    method: "get_closing_control_data",
                    args: [[this.pos_session.id]],
                });
                const ordersDetails = closingData.orders_details;
                const paymentsAmount = closingData.payments_amount;
                const openingNotes = closingData.opening_notes;
                const defaultCashDetails = closingData.default_cash_details;
                const otherPaymentMethods = closingData.other_payment_methods;
                const isManager = closingData.is_manager;
                const amountAuthorizedDiff = closingData.amount_authorized_diff;
                const cashControl = this.config.cash_control;

                // Component state and refs difinition
                const state = {notes: "", acceptClosing: false, payments: {}};
                if (cashControl) {
                    state.payments[defaultCashDetails.id] = {
                        counted: 0,
                        difference: -defaultCashDetails.amount,
                        number: 0,
                    };
                }
                if (otherPaymentMethods.length > 0) {
                    otherPaymentMethods.forEach((pm) => {
                        if (pm.is_cash_count) {
                            state.payments[pm.id] = {
                                counted: round_decimals(
                                    pm.amount,
                                    this.currency.decimals
                                ),
                                difference: 0,
                                number: pm.number,
                            };
                        }
                    });
                }
                return {
                    ordersDetails,
                    paymentsAmount,
                    openingNotes,
                    defaultCashDetails,
                    otherPaymentMethods,
                    isManager,
                    state,
                    amountAuthorizedDiff,
                    cashControl,
                };
            } catch (error) {
                return {error};
            }
        },
    });

    return models;
});
