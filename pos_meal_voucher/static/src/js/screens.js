// Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
// @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

odoo.define("pos_meal_voucher.screens", function (require) {
    "use strict";

    var screens = require("point_of_sale.screens");

    screens.ScreenWidget.include({
        barcode_meal_voucher_payment_action: function (code) {

            // Display the payment screen, if it is not the current one.
            if (this.pos.gui.current_screen.template !== "PaymentScreenWidget"){
                this.gui.show_screen("payment");
            }
            var paymentScreen = this.pos.gui.current_screen;
            var order = this.pos.get_order();
            var amount = code.value;
            var cashregister = null;
            // find a meal voucher cash register, if exist
            for ( var i = 0; i < this.pos.cashregisters.length; i++ ) {
                if ( this.pos.cashregisters[i].journal.meal_voucher_type === "paper" ){
                    cashregister = this.pos.cashregisters[i];
                    break;
                }
            }
            if (!cashregister){
                return;
            }

            // Add new payment line with the amount found in the barcode
            this.pos.get_order().add_paymentline(cashregister);
            paymentScreen.reset_input()
            order.selected_paymentline.set_amount(amount);
            order.selected_paymentline.statement_note = code.code;
            paymentScreen.order_changes();
            paymentScreen.render_paymentlines();
            paymentScreen.$(".paymentline.selected .edit").text(paymentScreen.format_currency_no_symbol(amount));
        },

        // Setup the callback action for the "meal_voucher_payment" barcodes.
        show: function () {
            this._super();
            this.pos.barcode_reader.set_action_callback(
                "meal_voucher_payment",
                _.bind(this.barcode_meal_voucher_payment_action, this));
        },
    });


    screens.OrderWidget.include({
        update_summary: function () {
            this._super.apply(this, arguments);
            var order = this.pos.get_order();
            if (!order.get_orderlines().length) {
                return;
            }
            this.el.querySelector(".summary .meal-voucher .value").textContent = this.format_currency(order.get_total_meal_voucher_eligible());
        },
    });


    screens.PaymentScreenWidget.include({

        click_paymentmethods_meal_voucher_mixed: function(id) {
            var cashregister = null;
            for ( var i = 0; i < this.pos.cashregisters.length; i++ ) {
                if ( this.pos.cashregisters[i].journal_id[0] === id ){
                    cashregister = this.pos.cashregisters[i];
                    break;
                }
            }
            this.pos.get_order().add_paymentline( cashregister );
            // manually set meal voucher
            this.pos.get_order().selected_paymentline.manual_meal_voucher = true;
            this.reset_input();
            this.render_paymentlines();
        },

        render_paymentmethods: function() {
            var self = this;
            var methods = this._super.apply(this, arguments);
            methods.on('click','.paymentmethod-meal-voucher-mixed',function(){
                self.click_paymentmethods_meal_voucher_mixed($(this).data('id'));
            });
            return methods;
        },


        render_paymentlines: function() {
            var self  = this;

            this._super.apply(this, arguments);
            var order = this.pos.get_order();
            if (!order) {
                return;
            }
            // Update meal voucher summary
            var total_eligible = order.get_total_meal_voucher_eligible();
            this.el.querySelector("#meal-voucher-eligible-amount").textContent = this.format_currency(total_eligible);

            var max_amount = this.pos.config.max_meal_voucher_amount;
            if (max_amount !== 0) {
                this.el.querySelector("#meal-voucher-max-amount").textContent = this.format_currency(max_amount);
            }
            var total_received = order.get_total_meal_voucher_received();
            this.el.querySelector("#meal-voucher-received-amount").textContent = this.format_currency(total_received);

            // Display warnings
            if (total_received > total_eligible) {
                this.$("#meal-voucher-eligible-warning").removeClass("oe_hidden");
            } else {
                this.$("#meal-voucher-eligible-warning").addClass("oe_hidden");
            }
            if (total_received > max_amount) {
                this.$("#meal-voucher-max-warning").removeClass("oe_hidden");
            } else {
                this.$("#meal-voucher-max-warning").addClass("oe_hidden");
            }

        },

        order_is_valid: function(force_validation) {
            var self = this;
            var order = this.pos.get_order();

            var total_eligible = order.get_total_meal_voucher_eligible();
            var total_received = order.get_total_meal_voucher_received();
            var max_amount = this.pos.config.max_meal_voucher_amount;

            var current_max = total_eligible;
            if (max_amount) {
                current_max = Math.min(total_eligible, max_amount);
            }

            // if the change is too large, it's probably an input error, make the user confirm.
            if (!force_validation && (total_received > current_max)) {
                this.gui.show_popup("confirm", {
                    title: _t("Please Confirm Meal Voucher Amount"),
                    body:  _t("You are about to validate a meal voucher payment of ") +
                           this.format_currency(total_received) +
                           _t(", when the maximum amount is ") +
                           this.format_currency(current_max) +
                           _t(".\n\n Clicking 'Confirm' will validate the payment."),
                    confirm: function() {
                        // Note: Due to the bad design of the original function
                        // the check "Large Amount" will be skipped in that case.
                        self.validate_order("confirm");
                    },
                });
                return false;
            }
            return this._super.apply(this, arguments);;
        },
    });

});
