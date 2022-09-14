odoo.define("pos_fixed_discount_in_lines.PaymentScreen", function (require) {
    "use strict";

    const {useListener} = require("web.custom_hooks");
    const {useState} = owl.hooks;
    const NumberBuffer = require("point_of_sale.NumberBuffer");
    const PaymentScreen = require("point_of_sale.PaymentScreen");
    const Registries = require("point_of_sale.Registries");
    var utils = require("web.utils");
    var round_pr = utils.round_precision;

    const FixedDiscountPaymentScreen = (PaymentScreen) =>
        class extends PaymentScreen {
            constructor() {
                super(...arguments);
                this.state = useState({
                    fixed_discount: 0,
                });
                useListener("update-fixed-discount", this._updateFixedDiscount);
                this.remove_fixed_discount();
            }
            willUnmount() {
                var order = this.env.pos.get_order();
                if (!order.finalized) {
                    this.remove_fixed_discount();
                    var lines = order.paymentlines.models;
                    for (var i = 0; i < lines.length; i++) {
                        order.remove_paymentline(lines[i]);
                    }
                }
            }
            toggleDiscountEnabled() {
                // Click js_fixed_discount
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
            _updateFixedDiscount() {
                if (NumberBuffer.get() === null) {
                    this.remove_fixed_discount();
                } else {
                    var disc_value = NumberBuffer.getFloat();
                    this.apply_discount(0);
                    this.apply_discount(disc_value);
                    this.state.fixed_discount = this.env.pos.format_currency(
                        disc_value
                    );
                }
            }
            async apply_discount(amount) {
                if (this.env.pos.config.split_fixed_discount) {
                    var order = this.env.pos.get_order();
                    var lines = order.get_orderlines();
                    var total = order.get_total_without_tax();
                    var current_discount = order.get_total_discount();
                    var product = this.env.pos.db.get_product_by_id(
                        this.env.pos.config.rounding_product_id[0]
                    );
                    if (product === undefined) {
                        await this.showPopup("ErrorPopup", {
                            title: this.env._t("No rounding product found"),
                            body: this.env._t(
                                "The rounding product seems misconfigured. Make sure it is flagged as 'Can be Sold' and 'Available in Point of Sale'."
                            ),
                        });
                        return;
                    }
                    order.fixed_discount = amount;
                    var discount = (100 * amount) / (total + current_discount);
                    // Truncate to 3 decimals
                    discount = Math.trunc(discount * 1000) / 1000;
                    for (const ind in lines) {
                        if (amount > 0) {
                            lines[ind].discount += discount;
                            lines[ind].discountStr = String(lines[ind].discount);
                        } else {
                            lines[ind].discount = 0;
                            lines[ind].discountStr = "0";
                            // Remove existing discounts
                            if (lines[ind].get_product() === product) {
                                order.remove_orderline(lines[ind]);
                            }
                        }
                    }
                    var new_total = order.get_total_without_tax();
                    if (amount > 0 && total - amount !== new_total) {
                        var diff = round_pr(new_total - (total - amount), 0.01);
                        this.apply_discount_with_product(-diff);
                    }
                    order.select_orderline(lines[0]);
                    order.deselect_orderline();
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
                this.apply_discount(0);
                this.disable_fixed_discount_mode();
            }
            disable_fixed_discount_mode() {
                this.currentOrder.set_fixed_discount_enabled(false);
                NumberBuffer.config.triggerAtInput = "update-selected-paymentline";
            }
        };

    Registries.Component.extend(PaymentScreen, FixedDiscountPaymentScreen);

    return PaymentScreen;
});
