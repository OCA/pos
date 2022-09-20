odoo.define("pos_multi_discount_global.PaymentScreen", function (require) {
    "use strict";

    const {useListener} = require("web.custom_hooks");
    const {useState} = owl.hooks;
    const NumberBuffer = require("point_of_sale.NumberBuffer");
    const PaymentScreen = require("point_of_sale.PaymentScreen");
    const Registries = require("point_of_sale.Registries");
    var utils = require("web.utils");
    var round_pr = utils.round_precision;

    const MultiDiscountPaymentScreen = (PaymentScreen) =>
        class extends PaymentScreen {
            constructor() {
                super(...arguments);
                this.state = useState({
                    fixed_discount: 0,
                    percent_discount: 0,
                });
                useListener("update-fixed-discount", this._updateFixedDiscount);
                useListener("update-percent-discount", this._updatePercentDiscount);
                this.remove_fixed_discount();
                this.remove_percent_discount();
            }
            willUnmount() {
                // Var order = this.env.pos.get_order();
                // this.disable_fixed_discount_mode();
                // if (!order.finalized) {
                //     this.remove_fixed_discount();
                //     var lines = order.paymentlines.models;
                //     for (var i = 0; i < lines.length; i++) {
                //         order.remove_paymentline(lines[i]);
                //     }
                // }
            }
            toggleDiscountEnabled() {
                // Click js_fixed_discount
                this.disable_percent_discount_mode();
                this.currentOrder.set_fixed_discount_enabled(
                    !this.currentOrder.get_fixed_discount_enabled()
                );
                if (this.currentOrder.get_fixed_discount_enabled()) {
                    NumberBuffer.config.triggerAtInput = "update-fixed-discount";
                } else {
                    NumberBuffer.config.triggerAtInput = "update-selected-paymentline";
                }
                this.render();
            }
            togglePercentDiscountEnabled() {
                // Click js_percent_discount
                this.disable_fixed_discount_mode();
                this.currentOrder.set_percent_discount_enabled(
                    !this.currentOrder.get_percent_discount_enabled()
                );
                if (this.currentOrder.get_percent_discount_enabled()) {
                    NumberBuffer.config.triggerAtInput = "update-percent-discount";
                } else {
                    NumberBuffer.config.triggerAtInput = "update-selected-paymentline";
                }
                this.render();
            }
            _updateFixedDiscount() {
                if (NumberBuffer.get() === null) {
                    this.remove_fixed_discount();
                } else {
                    var disc_value = NumberBuffer.getFloat();
                    // This.apply_discount(0, 'reset');
                    this.apply_discount(disc_value, "fixed");
                    this.state.fixed_discount = this.env.pos.format_currency(
                        disc_value
                    );
                }
            }
            _updatePercentDiscount() {
                if (NumberBuffer.get() === null) {
                    this.remove_percent_discount();
                } else {
                    var disc_value = NumberBuffer.getFloat();
                    // This.apply_discount(0, 'reset');
                    this.apply_discount(disc_value, "percent");
                    this.state.percent_discount = disc_value;
                }
            }
            async apply_discount(amount, disc_type) {
                if (this.env.pos.config.split_fixed_discount) {
                    var order = this.env.pos.get_order();
                    var lines = order.get_orderlines();
                    var total = order.get_total_without_tax();
                    // Var current_discount = order.get_total_discount();
                    var product = this.env.pos.db.get_product_by_id(
                        this.env.pos.config.rounding_product_id[0]
                    );
                    var abs_discount_amount = 0;
                    if (product === undefined) {
                        await this.showPopup("ErrorPopup", {
                            title: this.env._t("No rounding product found"),
                            body: this.env._t(
                                "The rounding product seems misconfigured. Make sure it is flagged as 'Can be Sold' and 'Available in Point of Sale'."
                            ),
                        });
                        return;
                    }
                    if (disc_type === "fixed") {
                        this.reset_fixed_discount();
                        total = order.get_total_without_tax();
                        this.process_fixed_discount(amount, order);
                        abs_discount_amount = amount;
                    } else if (disc_type === "percent") {
                        this.reset_percent_discount();
                        total = order.get_total_without_tax();
                        this.process_percent_discount(amount, order);
                        abs_discount_amount = (amount * total) / 100;
                    }
                    var new_total = order.get_total_without_tax();
                    if (
                        abs_discount_amount > 0 &&
                        total - abs_discount_amount !== new_total
                    ) {
                        var diff = round_pr(
                            new_total - (total - abs_discount_amount),
                            0.01
                        );
                        if (diff !== 0) {
                            if (
                                (diff < 0 &&
                                    this.env.pos.config.only_positive_discount) ||
                                !this.env.pos.config.only_positive_discount
                            ) {
                                this.apply_discount_with_product(-diff);
                            }
                        }
                    }
                    order.select_orderline(lines[0]);
                    order.deselect_orderline();
                }
            }
            reset_fixed_discount() {
                var product = this.env.pos.db.get_product_by_id(
                    this.env.pos.config.rounding_product_id[0]
                );
                var order = this.env.pos.get_order();
                var lines = order.get_orderlines();
                for (const ind in lines) {
                    lines[ind].fixed_discount = 0;
                    lines[ind].set_discount(lines[ind].manual_discount);
                    // Remove existing discounts
                    if (lines[ind].get_product() === product) {
                        order.remove_orderline(lines[ind]);
                    }
                }
            }
            reset_percent_discount() {
                var product = this.env.pos.db.get_product_by_id(
                    this.env.pos.config.rounding_product_id[0]
                );
                var order = this.env.pos.get_order();
                var lines = order.get_orderlines();
                for (const ind in lines) {
                    lines[ind].percent_discount = 0;
                    lines[ind].set_discount(lines[ind].manual_discount);
                    // Remove existing discounts
                    if (lines[ind].get_product() === product) {
                        order.remove_orderline(lines[ind]);
                    }
                }
            }
            process_fixed_discount(amount, order) {
                var total = order.get_total_without_tax();
                var discount = (100 * amount) / total;
                order.fixed_discount = amount;
                discount = Number(Math.round(discount + "e2") + "e-2");
                var lines = order.get_orderlines();
                for (const ind in lines) {
                    lines[ind].fixed_discount = discount;
                    lines[ind].set_discount(lines[ind].manual_discount);
                }
            }
            process_percent_discount(amount, order) {
                order.percent_discount = amount;
                var discount = Number(Math.round(amount + "e2") + "e-2");
                var lines = order.get_orderlines();
                for (const ind in lines) {
                    lines[ind].percent_discount = discount;
                    lines[ind].set_discount(lines[ind].manual_discount);
                }
            }
            async apply_discount_with_product(amount) {
                var order = this.env.pos.get_order();
                var lines = order.get_orderlines();
                var product = this.env.pos.db.get_product_by_id(
                    this.env.pos.config.rounding_product_id[0]
                );
                if (product === undefined) {
                    await this.showPopup("ErrorPopup", {
                        title: this.env._t("No discount rounding found"),
                        body: this.env._t(
                            "The discount rounding seems misconfigured. Make sure it is flagged as 'Can be Sold' and 'Available in Point of Sale'."
                        ),
                    });
                    return;
                }
                // Remove existing discounts
                for (const line of lines) {
                    if (line.get_product() === product) {
                        order.remove_orderline(line);
                    }
                }

                // Add discount
                // We add the price as manually set to avoid recomputation when changing customer.
                if (product.taxes_id.length) {
                    var first_tax = this.env.pos.taxes_by_id[product.taxes_id[0]];
                    if (first_tax.price_include) {
                        order.get_total_with_tax();
                    }
                }
                // Var discount = round_pr(amount, this.env.pos.currency.rounding);

                order.add_product(product, {
                    price: amount,
                    lst_price: amount,
                    extras: {
                        price_manually_set: true,
                    },
                });
            }
            addNewPaymentLine() {
                this.disable_fixed_discount_mode();
                return super.addNewPaymentLine(...arguments);
            }
            remove_fixed_discount() {
                // This.apply_discount(0);
                this.disable_fixed_discount_mode();
            }
            remove_percent_discount() {
                // This.apply_discount(0);
                this.disable_percent_discount_mode();
            }
            disable_fixed_discount_mode() {
                this.currentOrder.set_fixed_discount_enabled(false);
                NumberBuffer.config.triggerAtInput = "update-selected-paymentline";
                NumberBuffer.reset();
            }
            disable_percent_discount_mode() {
                this.currentOrder.set_percent_discount_enabled(false);
                NumberBuffer.config.triggerAtInput = "update-selected-paymentline";
                NumberBuffer.reset();
            }
        };

    Registries.Component.extend(PaymentScreen, MultiDiscountPaymentScreen);

    return PaymentScreen;
});
